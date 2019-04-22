import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
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

  assetValidations = { barcode: validatePresence(true) };

  @computed('year')
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

  @action
  saveAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.get('isNew');
    model.save().then((result) => {
      if (isNew) {
        this.assets.pushObject(result);
      }
      this.toast.success(`The asset was successfully ${isNew ? 'created' : 'updated'}`);
      this.set('entry', null);
    }).catch((response) => { this.entry.rollbackAttributes();
      this.house.handleErrorResponse(response) });
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
