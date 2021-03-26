import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsTimesheetByCallsignRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/by-callsign', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('year', this.year);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
