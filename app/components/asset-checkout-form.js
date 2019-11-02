import Component from '@ember/component';
import EmberObject from '@ember/object';
import { action, computed } from '@ember/object';

import { validatePresence } from 'ember-changeset-validations/validators';

export default class AssetCheckoutFormComponent extends Component {
  attachments = null;
  person = null;
  assets = null;
  eventInfo = null;

  assetValdiations = {
    barcode: validatePresence(true)
  };

  assetForm = EmberObject.create({ });

  barcodeNotFound = false;
  barcodeCheckedOut = null;

  clearErrors() {
    this.set('barcodeNotFound', false);
    this.set('barcodeCheckedOut', null);
  }

  @computed('attachments')
  get attachmentOptions() {
    const options =  this.attachments.map((a) => [a.description, a.id]);
    options.unshift([ '-', '']);
    return options;
  }

  @action
  checkoutAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const barcode = model.get('barcode');
    this.toast.clear();
    this.clearErrors();

    this.set('isSubmitting', true);
    this.ajax.request('asset/checkout', {
      method: 'POST',
      data: { person_id: this.person.id, barcode, attachment_id: model.get('attachment_id') }
    }).then((result) => {
      switch (result.status) {
        case 'success':
          this.toast.success('Asset was succesfully checked out.');
          this.set('assetForm', EmberObject.create({ }));
          this.set('isAssetsRefreshing', true);
          this.assets.update()
            .catch((response) => this.house.handleErrorResponse(response))
            .finally(() => this.set('isAssetsRefreshing', true));
          break;

        case 'not-found':
          this.set('barcodeNotFound', barcode);
          break;

        case 'checked-out':
          result.barcode = barcode;
          this.set('barcodeCheckedOut', result);
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }

  @action
  showHistoryAction() {
    this.set('showHistory', true);
  }

  @action
  closeHistory() {
    this.set('showHistory', false);
  }
}
