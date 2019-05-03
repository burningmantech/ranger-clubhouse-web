import Controller from '@ember/controller';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class SearchAssetsController extends Controller {
  barcode = '';

  // The barcode that was not found
  barcodeNotFound = '';

  @action
  search() {
    const barcode = this.barcode.trim();

    if (barcode == '') {
      return;
    }

    this.set('barcodeNotFound', '');
    this.set('asset', null);

    this.set('isLoading', true);
    this.ajax.request('asset', { data: { barcode, year: this.house.currentYear(), include_history: 1 } })
      .then((results) => {
        if (results.asset.length == 0) {
          this.set('barcodeNotFound', barcode);
        } else {
          this.set('asset', results.asset.firstObject);
          this.set('barcode', '');
        }
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isLoading', false));
  }

  @action
  checkIn(row) {
    this.ajax.request(`asset/${this.asset.id}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        this.toast.success('Asset successfully checked in');
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
