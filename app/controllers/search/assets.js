import Controller from '@ember/controller';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class SearchAssetsController extends Controller {
  searchValidations = {
    barcode: [ validatePresence(true) ]
  };

  queryParams = [ 'barcode', 'year' ];

  @action
  searchAction(model, isValid) {
    if (!isValid) {
      return;
    }
    // Fire away!
    this.set('barcode',model.barcode);
  }

  @action
  checkIn(row) {
    set(row, 'isSaving', true);
    this.ajax.request(`asset/${this.asset.id}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        if (this.checkedOut == row) {
          this.set('checkedOut', null);
        }
        this.toast.success('Asset successfully checked in');
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(row, 'isSaving', false));
  }
}
