import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsRadioAssetsRoute extends ClubhouseRoute {
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
    let currentDescription = "";
    let currentPermAssign = 0;
    let permCount = 0;
    let currentPrefix = 0;
    let currentCount = 0;

    assets.forEach((radio) => {
      const description = radio.description;
      const permAssign = radio.perm_assign;
      let item = radio.barcode.match(/^(.*?)(\d+)$/);
      let barcode, prefix;

      if (item) {
        prefix = item[1];
        barcode = parseInt(item[2]);
      } else {
        barcode = radio.barcode;
        prefix = null;
      }

      if (permAssign) {
        permCount++;
      }

      /* start */
      if (currentStartBarcode === null) {
        currentStartBarcode = currentBarcode = barcode;
        currentDescription = description;
        currentPermAssign = permAssign;
        currentPrefix = prefix;
        currentCount = 1;
        return;
      }

      currentCount += 1;

      if (
        prefix === currentPrefix &&
        barcode === currentBarcode + 1 &&
        description === currentDescription &&
        permAssign === currentPermAssign) {
        currentBarcode = barcode;
        return;
      }

      this._buildSummary(
        radioSummaries,
        `${currentPrefix}${currentStartBarcode}`,
        currentBarcode,
        currentDescription,
        currentPermAssign,
        currentCount,
      );
      currentStartBarcode = currentBarcode = barcode;
      currentPrefix = prefix;
      currentDescription = description;
      currentPermAssign = permAssign;
      currentCount = 0;
    });

    this._buildSummary(radioSummaries,
      `${currentPrefix}${currentStartBarcode}`,
      `${currentPrefix}${currentBarcode}`,
      currentDescription,
      currentPermAssign,
      currentCount
    );

    controller.set('radioSummaries', radioSummaries);
    controller.set('permCount', permCount);
    controller.set('tempCount', assets.length - permCount);
  }

  _buildSummary(radioSummaries, start, current, description, perm_assign, count) {
    let barcode;

    if (start == current) {
      barcode = start;
      count = 1;
    } else {
      barcode = `${start} - ${current}`;
    }

    radioSummaries.push({
      barcode,
      count,
      description,
      perm_assign
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
