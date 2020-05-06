import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class AdminAssetsController extends Controller {
  queryParams = ['year'];

  tempIdFilter = 'All';
  descriptionFilter = 'All';

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

  @computed('house', 'year')
  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }

  @computed('assets.[]', 'assets.@each.{barcode,description,temp_id}', 'tempIdFilter', 'descriptionFilter')
  get viewAssets() {
    let assets = this.assets;

    if (this.descriptionFilter != 'All') {
      assets = assets.filter((asset) => asset.description == this.descriptionFilter);
    }

    if (this.tempIdFilter != 'All') {
      if (this.tempIdFilter == 'Blank') {
        assets = assets.filter((asset) => isEmpty(asset.temp_id));
      } else {
        assets = assets.filter((asset) => asset.temp_id == this.tempIdFilter);
      }
    }

    assets.sort((a, b) => a.barcode.localeCompare(b.barcode));

    return assets;
  }

  @computed('assets.@each.description')
  get tempIdOptions() {
    let options = this.assets.uniqBy('temp_id').mapBy('temp_id');

    options = options.map((opt) => (isEmpty(opt) ? 'Blank' : opt));

    options.sort((a, b) => (a || '').localeCompare((b || '')));

    options.unshift('All');
    return options;
  }

  @computed('assets.@each.type')
  get descriptionOptions() {
    const options = this.assets.uniqBy('description').mapBy('description');
    options.sort((a, b) => a.localeCompare(b));
    options.unshift('All');
    return options;
  }

  @action
  assetHistoryAction(asset) {
    this.set('assetForHistory', asset);
    this.set('isLoadingHistory', true);

    this.ajax.request(`asset/${asset.id}/history`)
      .then((results) => this.set('assetHistory', results.asset_history))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isLoadingHistory', false));
  }

  @action
  closeAssetHistory() {
    this.set('assetForHistory', null);
    this.set('assetHistory', null);
  }

  @action
  newAsset() {
    this.set('entry', this.store.createRecord('asset', {
      category: 'Operations',
      description: 'Radio',
      perm_assign: false,
    }));
  }

  @action
  editAsset(asset) {
    this.set('entry', asset);
  }

  async _createCopies(model, copies, baseNum, numLen, prefix, suffix) {
    this.set('isSubmitting', true);

    for (let i = 0; i < copies; i++) {
      const barcode = prefix+(baseNum+i).toString().padStart(numLen, '0')+suffix;
      this.set('creatingBarcode', barcode);
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
        this.set('isSubmitting', false);
        this.set('creatingBarcode', null);
        return;
      }
    }

    this.set('isSubmitting', false);
    this.set('entry', null);
    this.set('creatingBarcode', null);
    this.toast.success(`${copies} assets were succesfully created`);
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

    this.set('isSubmitting', true);
    model.save().then((result) => {
      if (isNew) {
        this.assets.pushObject(result);
      }
      this.toast.success(`The asset was successfully ${isNew ? 'created' : 'updated'}`);
      this.set('entry', null);
    }).catch((response) => {
      this.entry.rollbackAttributes();
      this.house.handleErrorResponse(response);
    }).finally(() => this.set('isSubmitting', false));
  }

  @action
  cancelAsset() {
    this.set('entry', null);
  }

  @action
  deleteAsset(asset) {
    this.modal.confirm('Confirm Asset Deletion',
      `Are you sure you wish to delete Barcode ${asset.barcode} (year ${this.year}) ${asset.description} ${asset.temp_id || ''} ?`,
      () => {
        asset.destroyRecord().then(() => {
          this.assets.removeObject(asset);
          this.toast.success('Asset was succesfully deleted');
        });
      });
  }
}
