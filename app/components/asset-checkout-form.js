import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validatePresence } from 'ember-changeset-validations/validators';
import { inject as service } from '@ember/service';

export default class AssetCheckoutFormComponent extends Component {
  @service ajax;
  @service toast;
  @service house;

  assetValdiations = {
    barcode: [ validatePresence(true) ]
  };

  @tracked assetForm = EmberObject.create({ });

  @tracked barcodeNotFound = null;
  @tracked barcodeCheckedOut = null;
  @tracked isSubmitting = false;
  @tracked showHistory = false;

  clearErrors() {
    this.barcodeNotFound = false;
    this.barcodeCheckedOut = null;
  }

  get attachmentOptions() {
    const options =  this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift([ '-', '']);
    return options;
  }

  @action
  checkoutAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const barcode = model.barcode;
    this.clearErrors();

    this.isSubmitting = true;
    this.ajax.request('asset/checkout', {
      method: 'POST',
      data: { person_id: this.args.person.id, barcode, attachment_id: model.attachment_id }
    }).then((result) => {
      switch (result.status) {
        case 'success':
          this.toast.success('Asset was successfully checked out.');
          this.assetForm = EmberObject.create({ });
          this.args.assets.update()
            .catch((response) => this.house.handleErrorResponse(response));
          break;

        case 'not-found':
          this.barcodeNotFound = barcode;
          break;

        case 'checked-out':
          this.barcodeCheckedOut =  result;
          this.barcodeCheckedOut.barcode = barcode;
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.isSubmitting = false);
  }

  @action
  showHistoryAction() {
    this.showHistory = true;
  }

  @action
  closeHistory() {
    this.showHistory = false;
  }
}
