import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminHoursCreditsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model(params) {
    const year = requestYear(params);
    return this.ajax.request('timesheet/hours-credits', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('eventStart', model.event_start);
    controller.set('eventEnd', model.event_end);
  }
}
