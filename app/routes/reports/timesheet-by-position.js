import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsTimesheetByPositionRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/by-position', {data: {year}});
  }

  setupController(controller, model) {
    const {positions, people} = model;
    positions.forEach((position) => {
      position.timesheets.forEach((t) => t.person = people[t.person_id]);
    })
    controller.positions = positions;
    controller.year = this.year;
    controller.positionsScrollList = positions.map((p) => ({id: `position-${p.id}`, title: p.title}));
    controller.status = model.status;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
