import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsRadioAssetsRoute extends Route {
  queryParams = {
    year: {
      refreshModel: true
    }
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      assets: this.ajax.request('asset', {
        data: {
          year,
          type: 'radio'
        },
      }).then((result) => result.asset),
      year
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    const assets = model.assets;
    const radioSummaries = [];
    controller.setProperties(model);
    controller.set('summary', false);

    let currentStartBarcode = null;
    let currentBarcode = 0;
    let currentTempId = "";
    let currentPermAssign = 0;
    let permCount = 0;

    assets.forEach((radio) => {
      const barcode = parseInt(radio.barcode);
      const tempId = radio.temp_id;
      const permAssign = radio.perm_assign;

      if (permAssign) {
        permCount++;
      }

      /* start */
      if (currentStartBarcode == null) {
        currentStartBarcode = currentBarcode = barcode;
        currentTempId = tempId;
        currentPermAssign = permAssign;
        return;
      }

      if (barcode == currentBarcode + 1 &&
        tempId == currentTempId &&
        permAssign == currentPermAssign) {
        currentBarcode = barcode;
        return;
      }

      this._buildSummary(radioSummaries,
        currentStartBarcode,
        currentBarcode,
        currentTempId,
        currentPermAssign
      );
      currentStartBarcode = currentBarcode = barcode;
      currentTempId = tempId;
      currentPermAssign = permAssign;
    });

    this._buildSummary(radioSummaries,
      currentStartBarcode,
      currentBarcode,
      currentTempId,
      currentPermAssign
    );

    controller.set('radioSummaries', radioSummaries);
    controller.set('permCount', permCount);
    controller.set('tempCount', assets.length - permCount);
  }

  _buildSummary(radioSummaries, start, current, temp_id, perm_assign) {
    let barcode;

    if (start == current) {
      barcode = start;
    } else {
      barcode = `${start} - ${current} (${current - start + 1})`;
    }

    radioSummaries.push({
      barcode,
      temp_id,
      perm_assign
    });
  }
}
