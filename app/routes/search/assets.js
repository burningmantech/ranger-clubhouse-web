import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { isEmpty } from '@ember/utils';

export default class SearchAssetsRoute extends ClubhouseRoute {
  queryParams = {
    barcode: { refreshModel: true },
    year: { refreshModel: true }
  };

  model({ barcode, year}) {
    this.barcode = barcode;

    if (!year) {
      year = this.house.currentYear();
    }

    this.year = year;
    if (!isEmpty(barcode)) {
      return this.ajax.request('asset', { data: { barcode, year, include_history: 1 } });
    } else {
      return null;
    }
  }

  setupController(controller, model) {
    let asset = null, notFound = false, checkedOut = null;
    const form = { barcode: '' };


    if (model) {
      // Barcode lookup was done.. check the results.
      const assets = model.asset;

      if (assets.length > 0) {
        // Found an asset
        asset = assets.firstObject;
        // Still checked out by someone?
        checkedOut = asset.asset_history.find((a) => a.checked_in == null);
      } else {
        // Barcode was not found
        notFound = true;
        form.barcode = this.barcode;
      }
    }

    controller.set('year', this.year);
    controller.set('barcodeNotFound', notFound);
    controller.set('checkedOut', checkedOut);
    controller.set('asset', asset);
    controller.set('assetForm',form);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('barcode', null);
    }
  }
}
