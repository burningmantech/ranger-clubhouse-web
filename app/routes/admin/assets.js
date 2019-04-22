import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { Role } from 'clubhouse/constants/roles';

export default class AdminAssetsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);

    this.house.roleCheck(Role.ADMIN);
  }

  model(params) {
    const year = requestYear(params);

    this.set('year', year);

    this.store.unloadAll('asset');

    return this.store.query('asset', { year }).then((result) => result.toArray());
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
