import Route from '@ember/routing/route';

export default class AdminBulkSignoutRoute extends Route {
  model() {
    return this.ajax.request('timesheet', { data: { is_on_duty: 1 } });
  }

  setupController(controller, model) {
    const {timesheet} = model;
    controller.set('selectAll', true);
    controller.set('timesheets', timesheet);
    timesheet.forEach((t) => t.selected = true);
  }
}
