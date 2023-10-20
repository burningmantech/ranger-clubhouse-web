import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, EDIT_ASSETS} from 'clubhouse/constants/roles';

export default class AdminAssetsRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_ASSETS];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    this.store.unloadAll('asset');
    return this.store.query('asset', {year});
  }

  setupController(controller, model) {
    controller.set('assetForHistory', null);
    controller.set('entry', null);
    controller.set('tempIdFilter', 'All');
    controller.set('descriptionFilter', 'All');
    controller.set('year', this.year);
    controller.set('assets', model);
  }
}
