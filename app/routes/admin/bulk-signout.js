import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminBulkSignoutRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('timesheet', { data: { is_on_duty: 1 } });
  }

  setupController(controller, model) {
    const {timesheet} = model;
    controller.set('selectAll', true);
    controller.buildTimesheets(timesheet);
  }
}
