import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsTimesheetByCallsignRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/by-callsign', {data: {year}});
  }

  setupController(controller, model) {
    const {people, positions, status} = model;

    people.forEach((person) => {
      person.timesheet.forEach((t) => t.position = positions[t.position_id])
    });

    controller.status = status;
    controller.people = people;
    controller.year = this.year;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
