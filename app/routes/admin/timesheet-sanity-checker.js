import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { Role } from 'clubhouse/constants/roles';

export default class AdminTimesheetSanityCheckerRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([ Role.ADMIN, Role.TIMESHEET_MANAGEMENT ]);
  }

  model(params) {
    const year = requestYear(params);

    return this.ajax.request('timesheet/sanity-checker', { data: { year } });
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }

}
