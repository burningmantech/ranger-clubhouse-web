import Route from '@ember/routing/route';
import {Role} from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class VcSpigotRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.VC]);
  }

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('intake/spigot', {data: {year}});
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('year', this.year);
    controller.set('showPeople', null);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
