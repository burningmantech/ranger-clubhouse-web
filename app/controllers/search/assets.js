import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class SearchAssetsController extends ClubhouseController {
  searchValidations = {
    barcode: [ validatePresence(true) ]
  };

  queryParams = [ 'barcode', 'year' ];

  @tracked checkedOut = null;
  @tracked asset = null;

  @action
  searchAction(model, isValid) {
    if (!isValid) {
      return;
    }
    // Fire away!
    set(this, 'barcode',model.barcode);
  }

  @action
  async checkIn(row) {
    set(row, 'isSaving', true);
    try {
      const result = await this.ajax.request(`asset/${this.asset.id}/checkin`, { method: 'POST' });
      set(row, 'checked_in', result.checked_in);
      if (this.checkedOut === row) {
        this.checkedOut = null;
      }
      this.toast.success('Asset successfully checked in');
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      set(row, 'isSaving', false);
    }
  }
}
