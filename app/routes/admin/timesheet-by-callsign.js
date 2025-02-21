import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminTimesheetByCallsignRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/by-callsign', { data: { year }});
  }

  setupController(controller, model) {
    const { people, positions } = model;

    people.forEach((person) => {
      person.timesheet.forEach((t) => t.position = positions[t.position_id])
    });

    controller.set('people', people);
    controller.set('year', this.year);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
