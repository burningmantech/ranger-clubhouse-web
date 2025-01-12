import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, EDIT_ASSETS} from 'clubhouse/constants/roles';

export default class OpsAssetsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ASSETS];

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
    controller.assetForHistory = null;
    controller.assets = model;
    controller.descriptionFilter = 'all';
    controller.entityAssignmentFilter = 'all';
    controller.entry = null;
    controller.expireFilter = 'all';
    controller.groupFilter = 'all';
    controller.tempIdFilter = 'all';
    controller.typeFilter = 'all';
    controller.orderNumberFilter = 'all';
    controller.year = this.year;
  }
}
