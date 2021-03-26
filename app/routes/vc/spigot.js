import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class VcSpigotRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  queryParams = {
    year: {refreshModel: true}
  };

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
