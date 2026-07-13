import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, EDIT_ASSETS} from 'clubhouse/constants/roles';
import {FILTER_NAMES} from 'clubhouse/controllers/ops/assets';

export default class OpsAssetsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ASSETS];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    this.store.unloadAll('asset');
    return this.store.query('asset', {year, include_checked_out: 1});
  }

  setupController(controller, model) {
    controller.assetForHistory = null;
    controller.assets = model;
    controller.entry = null;

    // year is a refreshModel queryParam, so reset all filters on (re)entry.
    FILTER_NAMES.forEach((name) => (controller[name] = 'all'));

    controller.year = this.year;
  }
}
