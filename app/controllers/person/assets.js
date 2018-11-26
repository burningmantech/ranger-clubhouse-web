import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import EmberObject from '@ember/object';

export default class PersonAssetsController extends Controller {
  assets = [];
  queryParams = [ 'year' ];

  checkoutForm = EmberObject.create({
      barcode: ''
  });

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
  changeYearAction(year) {
    this.set('year', year);
  }

  @action
  submitAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const barcode = model.get('barcode');
    this.toast.clear();
    this.clearErrors();

    this.ajax.request('asset-person/checkout', {
      method: 'POST',
      data: { person_id: this.person.id, barcode, attachment_id: model.get('attachment_id') }
    }).then((result) => {
      switch (result.status) {
        case 'success':
          this.toast.success('Asset was succesfully checked out.');
          this.assets.update();
          model.set('barcode', '');
          model.set('attachment_id', '');
          break;

        case 'not-found':
          this.set('barcodeNotFound', barcode);
          break;

        case 'checked-out':
          this.set('barcodeCheckedOut', {
            person_id: result.person_id,
            callsign: result.callsign,
            barcode
          })
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response) );
  }

  @action
  checkInAction(asset) {
    asset.checkInAction().then(() => {
      this.toast.success('Asset has been successfully checked in.');
      this.assets.update();
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
