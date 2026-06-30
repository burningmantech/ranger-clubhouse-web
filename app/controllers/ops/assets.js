import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {validatePresence} from 'ember-changeset-validations/validators';
import _ from 'lodash';
import {cached, tracked} from '@glimmer/tracking';
import {
  TYPE_AMBER, TYPE_DESKTOP_RADIO,
  TYPE_GEAR,
  TYPE_KEY, TYPE_MOBILE_RADIO,
  TYPE_RADIO, TYPE_RADIO_CHARGER,
  TYPE_TEMP_ID,
  TYPE_VEHICLE, TypeLabels, TypeSort
} from "clubhouse/models/asset";

const CSV_COLUMNS = [
  {title: 'Barcode', key: 'barcode'},
  {title: 'Type', key: 'type'},
  {title: 'Description', key: 'description'},
  {title: 'Duration', key: 'assignmentLabel'},
  {title: 'Asset Group', key: 'group_name'},
  {title: 'Entity Assignment', key: 'entity_assignment'},
  {title: 'Year', key: 'year'},
  {title: 'Expires On', key: 'expires_on', format: 'date'},
  {title: 'Has Expired', key: 'has_expired', yesno: true},
  {title: 'Created At', key: 'created_at'},
  {title: 'Notes', key: 'notes'},
];

const BLANK = 'Blank';

const BARCODE_NUMERIC_RE = /^(.*?)(\d+)(\D*)$/;

// Filter tracked properties that reset whenever the year (refreshModel) changes.
export const FILTER_NAMES = [
  'descriptionFilter',
  'entityAssignmentFilter',
  'expireFilter',
  'groupFilter',
  'orderNumberFilter',
  'typeFilter',
];

// Drives the near-identical Blank/equality string filters in viewAssets.
// Each tuple is [filter tracked property, asset column].
const StringFilters = [
  ['descriptionFilter', 'description'],
  ['groupFilter', 'group_name'],
  ['entityAssignmentFilter', 'entity_assignment'],
  ['orderNumberFilter', 'order_number'],
];

function formatBarcode(prefix, num, numLen, suffix) {
  return prefix + num.toString().padStart(numLen, '0') + suffix;
}

export default class OpsAssetsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked descriptionFilter = 'all';
  @tracked entityAssignmentFilter = 'all';
  @tracked expireFilter = 'all';
  @tracked groupFilter = 'all';
  @tracked orderNumberFilter = 'all';
  @tracked typeFilter = 'all';

  @tracked assets;

  @tracked assetForHistory;
  @tracked entry = null;

  @tracked isSubmitting = false;
  @tracked creatingBarcode = null;

  assetTypeOptions = [
    {
      groupName: 'Common Types',
      options: [
        ['Radio', TYPE_RADIO],
        ['Desktop Radio', TYPE_DESKTOP_RADIO],
        ['Mobile/Vehicle Radio', TYPE_MOBILE_RADIO],
        ['Radio Charger', TYPE_RADIO_CHARGER],
        ['Gear', TYPE_GEAR],
        ['Temporary BMID', TYPE_TEMP_ID],
      ]
    },
    {
      groupName: 'Deprecated',
      options: [
        ['Amber', TYPE_AMBER],
        ['Key', TYPE_KEY],
        ['Vehicle', TYPE_VEHICLE],
      ]
    }
  ];

  permanentOptions = [
    ['Shift / Temporary', false],
    ['Event / Permanent', true],
  ];

  assetValidations = {barcode: [validatePresence(true)]};

  @cached
  get totalAssetCount() {
    return this.assets.length;
  }

  @cached
  get matchedCount() {
    return this.viewAssets.length;
  }

  @cached
  get viewAssets() {
    let assets = [...this.assets];

    if (this.typeFilter !== 'all') {
      assets = assets.filter((asset) => asset.type === this.typeFilter);
    }

    for (const [filterName, column] of StringFilters) {
      assets = this.applyBlankOrEquals(assets, this[filterName], column);
    }

    switch (this.expireFilter) {
      case 'all':
        break;
      case 'expired':
        assets = assets.filter((asset) => asset.has_expired);
        break;
      case 'not-expired':
        assets = assets.filter((asset) => !asset.has_expired);
        break;
      default:
        assets = assets.filter((asset) => asset.expires_on === this.expireFilter);
        break;
    }

    assets.sort((a, b) => (a.barcode || '').localeCompare(b.barcode || '', undefined, {numeric: true, sensitivity: 'base'}));

    return assets;
  }

  applyBlankOrEquals(assets, value, column) {
    if (value === 'all') {
      return assets;
    }

    if (value === BLANK) {
      return assets.filter((asset) => isEmpty(asset[column]));
    }

    return assets.filter((asset) => asset[column] === value);
  }

  @cached
  get viewAssetsByType() {
    return _.map(_.groupBy(this.viewAssets, 'type'), (assets, type) => ({type, label: TypeLabels[type], assets}))
      .sort((a, b) => (TypeSort[a.type] - TypeSort[b.type]));
  }

  @cached
  get descriptionOptions() {
    return this._buildOptions('description');
  }

  @cached
  get groupOptions() {
    return this._buildOptions('group_name');
  }

  @cached
  get entityAssignmentOptions() {
    return this._buildOptions('entity_assignment');
  }

  @cached
  get orderNumberOptions() {
    return this._buildOptions('order_number');
  }

  _buildOptions(column) {
    // Collapse null / '' / undefined to a single sentinel before de-duping so
    // heterogeneous empties don't each produce their own "Blank" option.
    const values = _.uniq(this.assets.map((a) => (isEmpty(a[column]) ? BLANK : a[column])));

    const options = values.sort((a, b) => a.localeCompare(b)).map((value) => [value, value]);

    options.unshift(['All', 'all']);
    return options;
  }

  @cached
  get typeOptions() {
    const options = _.uniqBy(this.assets, 'type').map((a) => [a.typeLabel, a.type]);
    options.sort((a, b) => a[0].localeCompare(b[0]));
    options.unshift(['All', 'all']);
    return options;
  }

  @cached
  get expireFilterOptions() {
    const options = _.sortBy(_.uniqBy(this.assets.filter((a) => a.expires_on !== null), 'expires_on'), 'expires_on')
      .map((a) => [a.expires_on, a.expires_on]);

    options.unshift(['Not Expired', 'not-expired']);
    options.unshift(['Expired', 'expired']);
    options.unshift(['All', 'all']);
    return options;
  }

  @action
  assetHistoryAction(asset) {
    this.assetForHistory = asset;
  }

  @action
  closeAssetHistory() {
    this.assetForHistory = null;
  }

  @action
  newAsset() {
    this.entry = this.store.createRecord('asset', {
      type: TYPE_RADIO,
      group_name: 'Operations',
      perm_assign: false,
      year: this.session.currentYear(),
    });
  }

  @action
  editAsset(asset) {
    this.entry = asset;
  }

  async _createCopies(model, copies, baseNum, numLen, prefix, suffix) {
    this.isSubmitting = true;

    for (let i = 0; i < copies; i++) {
      const barcode = formatBarcode(prefix, baseNum + i, numLen, suffix);
      this.creatingBarcode = barcode;
      const record = this.store.createRecord('asset', {
        barcode,
        group_name: model.group_name,
        description: model.description,
        entity_assignment: model.entity_assignment,
        expires_on: model.expires_on,
        notes: model.notes,
        order_number: model.order_number,
        perm_assign: model.perm_assign,
        type: model.type,
        year: model.year,
      });

      try {
        await record.save();
      } catch (response) {
        this.errors.handleErrorResponse(response);
        this.isSubmitting = false;
        this.creatingBarcode = null;
        return;
      }
    }

    try {
      await this.assets.update();
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }

    this.isSubmitting = false;
    this.creatingBarcode = null;
    this.entry = null;
    this.toast.success(`${copies} assets were successfully created`);
  }

  @action
  async saveAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    let copies = 1;
    if (isNew && !isEmpty(model.copies)) {
      if (!/^\d+$/.test(`${model.copies}`.trim()) || parseInt(model.copies, 10) < 1) {
        this.toast.error('Copies must be a whole number of 1 or more.');
        return;
      }
      copies = parseInt(model.copies, 10);
    }

    if (isNew && copies > 1) {
      const barcode = model.barcode;
      const matches = barcode.match(BARCODE_NUMERIC_RE);
      if (!matches) {
        this.toast.error('Sorry, barcodes can only be duplicated with numbers - e.g. SANDMAN1001');
        return;
      }

      const numLen = matches[2].length;
      const baseNum = parseInt(matches[2]);
      const prefix = matches[1];
      const suffix = matches[3];
      const endingBarcode = formatBarcode(prefix, baseNum + copies - 1, numLen, suffix);

      this.modal.confirm(`Confirm ${copies} assets`,
        `Are you sure you want to create ${copies} assets starting at ${model.barcode} and end at ${endingBarcode}?`,
        () => this._createCopies(model, copies, baseNum, numLen, prefix, suffix)
      );

      return;
    }

    if (await this.saveModel.save({model, message: `The asset was successfully ${isNew ? 'created' : 'updated'}`, owner: this})) {
      if (isNew) {
        await this.assets.update();
      }
      this.entry = null;
    }
  }

  @action
  cancelAsset() {
    this.entry = null;
  }

  @action
  deleteAsset() {
    const asset = this.entry;
    this.modal.confirm('Confirm Asset Deletion',
      `Are you sure you wish to delete Barcode ${asset.barcode} (year ${this.year}) ${asset.type} ${asset.description ?? ''} ?`,
      async () => {
        this.isSubmitting = true;
        try {
          await asset.destroyRecord();
          this.toast.success('Asset was successfully deleted');
          this.entry = null;
        } catch (response) {
          this.errors.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  exportToCSV({type, assets}) {
    this.download.downloadCsv(`${this.year}-${type}-assets-csv`, CSV_COLUMNS, assets);
  }
}
