import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {validatePresence} from 'ember-changeset-validations/validators';
import _ from 'lodash';
import {tracked} from '@glimmer/tracking';
import {
  TYPE_AMBER,
  TYPE_GEAR,
  TYPE_KEY,
  TYPE_RADIO,
  TYPE_TEMP_ID,
  TYPE_VEHICLE
} from "clubhouse/models/asset";

const CSV_COLUMNS = [
  {title: 'Barcode', key: 'barcode'},
  {title: 'Type', key: 'type'},
  {title: 'Description', key: 'description'},
  {title: 'Assignment', key: 'assigned'},
  {title: 'Category', key: 'category'},
  {title: 'Notes', key: 'notes'},
  {title: 'Year', key: 'year'},
  {title: 'Expires On', key: 'expires_on', format: 'date'},
  {title: 'Has Expired', key: 'has_expired'},
  {title: 'Created At', key: 'created_at'},
];

export default class OpsAssetsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked descriptionFilter = 'All';
  @tracked typeFilter = 'All';
  @tracked expireFilter = 'all';

  @tracked assets;

  @tracked assetForHistory;
  @tracked assetHistory;
  @tracked isLoadingHistory = false;
  @tracked entry = null;

  @tracked isSubmitting = false;
  @tracked creatingBarcode = null;

  assetDescriptionOptions = [
    {
      groupName: 'Common Types',
      options: [
        ['Radio', TYPE_RADIO],
        ['Gear', TYPE_GEAR],
        ['Temporary ID', TYPE_TEMP_ID],
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
    ['Permanent (Event)', true],
    ['Temporary (Shift)', false]
  ];

  categoryOptions = [
    'Operations',
    'SITE',
    'Gerlach Patrol'
  ];

  assetValidations = {barcode: [validatePresence(true)]};

  get isCurrentYear() {
    return this.house.currentYear() === +this.year;
  }

  get viewAssets() {
    let assets = [...this.assets];

    if (this.typeFilter !== 'All') {
      assets = assets.filter((asset) => asset.type === this.typeFilter);
    }

    if (this.descriptionFilter !== 'All') {
      if (this.descriptionFilter === 'Blank') {
        assets = assets.filter((asset) => isEmpty(asset.description));
      } else {
        assets = assets.filter((asset) => asset.description === this.descriptionFilter);
      }
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

    assets.sort((a, b) => a.barcode.localeCompare(b.barcode));

    return assets;
  }

  get descriptionOptions() {
    let options = _.uniqBy(this.assets, 'description').map((a) => a.description);

    options = options.map((opt) => (isEmpty(opt) ? 'Blank' : opt));

    options.sort((a, b) => (a || '').localeCompare((b || '')));

    options.unshift('All');
    return options;
  }

  get typeOptions() {
    const options = _.uniqBy(this.assets, 'type').map((a) => [a.typeLabel, a.type]);
    options.sort((a, b) => a[0].localeCompare(b[0]));
    options.unshift('All');
    return options;
  }

  get expireFilterOptions() {
    const options = _.sortBy(_.uniqBy(this.assets.filter((a) => a.expires_on !== null), 'expires_on'), 'expires_on')
      .map((a) => [a.expires_on, a.expires_on]);

    options.unshift(['Not Expired', 'not-expired']);
    options.unshift(['Expired', 'expired']);
    options.unshift(['All', 'all']);
    return options;
  }

  @action
  async assetHistoryAction(asset) {
    this.assetForHistory = asset;
    this.isLoadingHistory = true;

    try {
      this.assetHistory = (await this.ajax.request(`asset/${asset.id}/history`)).asset_history;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoadingHistory = false;
    }
  }

  @action
  closeAssetHistory() {
    this.assetForHistory = null;
  }

  @action
  newAsset() {
    this.entry = this.store.createRecord('asset', {
      type: TYPE_RADIO,
      category: 'Operations',
      perm_assign: false,
      year: this.house.currentYear(),
    });
  }

  @action
  editAsset(asset) {
    this.entry = asset;
  }

  async _createCopies(model, copies, baseNum, numLen, prefix, suffix) {
    this.isSubmitting = true;

    for (let i = 0; i < copies; i++) {
      const barcode = prefix + (baseNum + i).toString().padStart(numLen, '0') + suffix;
      this.creatingBarcode = barcode;
      const record = this.store.createRecord('asset', {
        barcode,
        type: model.type,
        description: model.description,
        notes: model.notes,
        perm_assign: model.perm_assign,
        category: model.category,
        year: model.year,
        expires_on: model.expires_on,
      });

      try {
        await record.save();
      } catch (response) {
        this.house.handleErrorResponse(response);
        this.isSubmitting = false;
        this.creatingBarcode = null;
        return;
      }
    }

    try {
      await this.assets.update();
    } catch (response) {
      this.house.handleErrorResponse(response);
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

    const copies = parseInt(model.copies);
    if (isNew && copies > 1) {
      const barcode = model.barcode;
      const matches = barcode.match(/^(.*?)(\d+)(\D*)$/);
      if (!matches) {
        this.toast.error('Sorry, barcodes can only be duplicated with numbers - e.g. SANDMAN1001');
        return;
      }

      const numLen = matches[2].length;
      const baseNum = parseInt(matches[2]);
      const prefix = matches[1];
      const suffix = matches[3];
      const endingBarcode = prefix + (baseNum + copies - 1).toString().padStart(numLen, '0') + suffix;

      this.modal.confirm(`Confirm ${copies} assets`,
        `Are you sure you want to create ${copies} assets starting at ${model.barcode} and end at ${endingBarcode}?`,
        () => this._createCopies(model, copies, baseNum, numLen, prefix, suffix)
      );

      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      if (isNew) {
        await this.assets.update();
      }
      this.toast.success(`The asset was successfully ${isNew ? 'created' : 'updated'}`);
      this.entry = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
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
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  exportToCSV() {
    const assets = [...this.viewAssets];
    assets.forEach((asset) => {
      asset.assigned = asset.perm_assign ? 'Event' : 'Shift';
      asset.has_expired = asset.has_expired ? 'Y' : '-';
    });

    this.house.downloadCsv(`${this.year}-assets-csv`, CSV_COLUMNS, assets);
  }
}
