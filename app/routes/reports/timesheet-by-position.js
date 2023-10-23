import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsTimesheetByPositionRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/by-position', { data: { year }});
  }

  setupController(controller, model) {
    const { positions, people} = model;
    positions.forEach((position) => {
      position.timesheets.forEach((t) => t.person = people[t.person_id]);
    })
    controller.set('positions', positions);
    controller.set('year', this.year);
    controller.set('positionsScrollList', positions.map((p)=> ({ id: `position-${p.id}`, title: p.title })));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
