import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class SearchAssetsController extends Controller {
  barcode = '';
  // set true if the barcode was not found.
  notFound = false;
  // The barcode that was not found
  notFoundBarcode = '';

  // Found asset matching barcode
  asset = null;

  @action
  search() {
    const barcode = this.barcode.trim();

    if (barcode == '') {
      return;
    }

    this.set('notFound', false);

    this.ajax.request('asset', { data: { barcode, include_history: 1 } })
    .then((results) => {
      this.set('asset', results.asset.firstObject);
    }).catch((response) => {
      if (response.status == 404) {
        this.set('notFound', true);
        this.set('notFoundBarcode', barcode);
      } else {
        this.house.handleErrorResponse(response);
      }
    })
  }
}
