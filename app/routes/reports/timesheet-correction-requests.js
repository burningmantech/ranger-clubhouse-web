import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { Role } from 'clubhouse/constants/roles';

export default class ReportsTimesheetCorrectionRequestsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.TIMESHEET_MANAGER ]);
  }

  model(params) {
    const year = requestYear(params);
    return this.ajax.request('timesheet/correction-requests', {
      data: { year }
    });
  }

  setupController(controller, model) {
    // corrections, missing_requests
    controller.setProperties(model);
  }
}
