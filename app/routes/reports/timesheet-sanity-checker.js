import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';

export default class ReportsTimesheetSanityCheckerRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];

  queryParams = {
    year: {refreshModel: true}
  };


  model(params) {
    const year = requestYear(params);

    return this.ajax.request('timesheet/sanity-checker', {data: {year}});
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
