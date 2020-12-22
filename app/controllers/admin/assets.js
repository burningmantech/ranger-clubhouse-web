import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';
import _ from 'lodash';
import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';

@classic
export default class AdminAssetsController extends Controller {
  queryParams = ['year'];

  @tracked tempIdFilter = 'All';
  @tracked descriptionFilter = 'All';
  @tracked assets;

  @tracked assetForHistory;
  @tracked assetHistory;
  @tracked isLoadingHistory = false;
  @tracked entry = null;

  @tracked isSubmitting = false;
  @tracked creatingBarcode = null;

  assetDescriptionOptions = [
    'Radio',
    'Gear',
    'Vehicle',
    'Amber',
    'Key'
  ];

  permanentOptions = [
    ['Permanent', true],
    ['Temporary', false]
  ];

  categoryOptions = [
    'Operations',
    'SITE',
    'Gerlach Patrol'
  ];

  assetValidations = { barcode: [ validatePresence(true) ] };

  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }

  get viewAssets() {
    let assets = this.assets;

    if (this.descriptionFilter !== 'All') {
      assets = assets.filter((asset) => asset.description === this.descriptionFilter);
    }

    if (this.tempIdFilter !== 'All') {
      if (this.tempIdFilter === 'Blank') {
        assets = assets.filter((asset) => isEmpty(asset.temp_id));
      } else {
        assets = assets.filter((asset) => asset.temp_id === this.tempIdFilter);
      }
    }

    assets.sort((a, b) => a.barcode.localeCompare(b.barcode));

    return assets;
  }

  @computed('assets.@each.description')
  get tempIdOptions() {
    let options = _.uniqBy(this.assets, 'temp_id').map((a) => a.temp_id);

    options = options.map((opt) => (isEmpty(opt) ? 'Blank' : opt));

    options.sort((a, b) => (a || '').localeCompare((b || '')));

    options.unshift('All');
    return options;
  }

  @computed('assets.@each.type')
  get descriptionOptions() {
    const options = _.uniqBy(this.assets, 'description').map((a) => a.description);
    options.sort((a, b) => a.localeCompare(b));
    options.unshift('All');
    return options;
  }

  @action
  assetHistoryAction(asset) {
    this.assetForHistory = asset;
    this.isLoadingHistory = true;

    this.ajax.request(`asset/${asset.id}/history`)
      .then((results) => this.assetHistory = results.asset_history)
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoadingHistory = false);
  }

  @action
  closeAssetHistory() {
    this.assetForHistory = null;
  }

  @action
  newAsset() {
    this.entry = this.store.createRecord('asset', {
      category: 'Operations',
      description: 'Radio',
      perm_assign: false,
    });
  }

  @action
  editAsset(asset) {
    this.entry = asset;
  }

  async _createCopies(model, copies, baseNum, numLen, prefix, suffix) {
    this.isSubmitting = true;

    for (let i = 0; i < copies; i++) {
      const barcode = prefix+(baseNum+i).toString().padStart(numLen, '0')+suffix;
      this.creatingBarcode = barcode;
      const record = this.store.createRecord('asset', {
        barcode,
        description: model.get('description'),
        temp_id: model.get('temp_id'),
        notes: model.get('notes'),
        perm_assign: model.get('perm_assign'),
        category: model.get('category'),
        subtype: model.get('subtype'),
        color: model.get('color'),
        style: model.get('style')
      });

      try {
        await record.save();
        this.assets.pushObject(record);
      } catch (response) {
        this.house.handleErrorResponse(response);
        this.isSubmitting = false;
        this.creatingBarcode = null;
        return;
      }
    }


    this.isSubmitting = false;
    this.creatingBarcode = null;
    this.entry = null;
    this.toast.success(`${copies} assets were successfully created`);
  }

  @action
  saveAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.get('isNew');

    if (isNew && parseInt(model.get('copies')) > 1) {
      const copies = parseInt(model.get('copies'));
      const barcode = model.get('barcode');
      const matches = barcode.match(/^(.*?)(\d+)(\D*)$/);
      if (!matches) {
        this.toast.error('Sorry, barcodes can only be duplicated with numbers - e.g. SANDMAN1001');
        return;
      }

      const numLen = matches[2].length;
      const baseNum = parseInt(matches[2]);
      const prefix = matches[1];
      const suffix = matches[3];
      const endingBarcode = prefix+(baseNum+copies-1).toString().padStart(numLen, '0')+suffix;

      this.modal.confirm(`Confirm ${copies} assets`,
        `Are you sure you want to create ${copies} assets starting at ${model.get('barcode')} and end at ${endingBarcode}?`,
        () => this._createCopies(model, copies, baseNum, numLen, prefix, suffix)
      );

      return;
    }

    this.isSubmitting = true;
    model.save().then(() => {
      if (isNew) {
        this.assets.pushObject(this.entry);
      }
      this.toast.success(`The asset was successfully ${isNew ? 'created' : 'updated'}`);
      this.entry = null;
    }).catch((response) => {
      this.entry.rollbackAttributes();
      this.house.handleErrorResponse(response);
    }).finally(() => this.isSubmitting = false);
  }

  @action
  cancelAsset() {
    this.entry = null;
  }

  @action
  deleteAsset(asset) {
    this.modal.confirm('Confirm Asset Deletion',
      `Are you sure you wish to delete Barcode ${asset.barcode} (year ${this.year}) ${asset.description} ${asset.temp_id || ''} ?`,
      () => {
        asset.destroyRecord().then(() => {
          this.assets.removeObject(asset);
          this.toast.success('Asset was successfully deleted');
        });
      });
  }
}
