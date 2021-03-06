import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminAssetsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    this.store.unloadAll('asset');
    return this.store.query('asset', {year}).then((result) => result.toArray());
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
