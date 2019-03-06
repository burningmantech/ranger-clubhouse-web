import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { Role } from 'clubhouse/constants/roles';

export default class ReportsTimesheetUnconfirmedRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.TIMESHEET_MANAGER, Role.VIEW_PII ]);
  }

  model(params) {
    const year = requestYear(params);
    return this.ajax.request('timesheet/unconfirmed-people', {
      data: { year }
    });
  }

  setupController(controller, model) {
    // unconfirmed_people
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
