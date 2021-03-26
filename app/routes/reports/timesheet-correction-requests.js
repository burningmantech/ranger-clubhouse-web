import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';

export default class ReportsTimesheetCorrectionRequestsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    return this.ajax.request('timesheet/correction-requests', {data: {year}});
  }

  setupController(controller, model) {
    // corrections, missing_requests
    controller.setProperties(model);
    controller.set('callsignFilter', 'All');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
