import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, TIMESHEET_MANAGEMENT, VIEW_PII} from 'clubhouse/constants/roles';

export default class ReportsTimesheetUnconfirmedRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT, VIEW_PII];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    return this.ajax.request('timesheet/unconfirmed-people', {
      data: {year}
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
