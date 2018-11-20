import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

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
    this.ajax.request('asset', { data: { barcode, include_history: 1 } })
    .then((results) => {
      if (results.asset.length == 0) {
        this.set('barcodeNotFound', barcode);
      } else {
        this.set('asset', results.asset.firstObject);
        this.set('barcode', '');
      }
    })
    .catch((response) =>  this.house.handleErrorResponse(response))
    .finally(() => this.set('isLoading', false));
  }
}
