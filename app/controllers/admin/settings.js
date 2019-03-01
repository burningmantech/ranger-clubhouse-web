import Controller from '@ember/controller';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember-decorators/object';

export default class AdminSettingsController extends Controller {
  typeOptions = [
    'bool',
    'integer',
    'string',
    'json'
  ];

  booleanOptions = [ 'true', 'false' ];

  _isValidJson(value) {
    if (isEmpty(value)) {
      return true;
    }

    try {
      const json = JSON.parse(value);
      return (typeof json === 'object');
    } catch (e) {
      return false;
    }
  }

  @computed('settings.[]', 'filterByName')
  get viewSettings() {
    let name = this.filterByName;
    if (name) {
      name = name.trim();
    }

    if (isEmpty(name)) {
      return this.settings;
    }
    return this.settings.filter((s) => RegExp(name, 'i').test(s.name) );
  }

  @computed('updateValue.options')
  get valueOptions()
  {
    return this.updateValue.options.trim().split("\n");
  }

  @action
  updateValueAction(setting) {
    this.set('updateValue', setting);
  }

  @action
  saveValue(model, isValid) {
    if (!isValid)
      return;

    this.toast.clear();

    if (model.get('type') == 'json' && !this._isValidJson(model.get('value'))) {
      this.toast.error('The JSON blob does not appear to be valid. Sorry.');
      return;
    }

    model.save().then(() => {
      this.set('updateValue', null);
      this.toast.success(`The setting value has been successfully update.`);
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelValue() {
    this.set('updateValue', null);
  }

  @action
  newSetting() {
    this.set('setting', this.store.createRecord('setting', {
      type: 'string'
    }));
  }

  @action
  edit(setting) {
    this.set('setting', setting)
  }

  @action
  save(model, isValid) {
    if (!isValid)
      return;
    const isNew = model.get('isNew');

    this.toast.clear();

    if (model.get('type') == 'json' && !this._isValidJson(model.get('value'))) {
      this.toast.error('The JSON blob does not appear to be valid. Sorry.');
      return;
    }

    model.save().then(() => {
      this.set('setting', null);
      this.toast.success(`The configuration setting has been successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.settings.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancel() {
    this.set('setting', null);
  }

  @action
  remove(setting) {
    this.modal.confirm('Delete Setting', `Are you sure you want to delete "${setting.name}"? This have unintented consequence.`, () => {
      setting.destroyRecord().then(() => {
        this.toast.success('The setting has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  filterSettings(name) {
    this.set('filterByName', name);
  }

  @action
  clearFilter() {
    this.set('filterByName', '');
  }
}
