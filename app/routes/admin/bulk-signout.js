import Route from '@ember/routing/route';

export default class AdminBulkSignoutRoute extends Route {
  model() {
    return this.ajax.request('timesheet', { data: { on_duty: 1 } });
  }

  setupController(controller, model) {
    const timesheets = model.timesheet;
    controller.set('timesheets', timesheets);
    controller.set('selectAll', true);
    timesheets.forEach((ts) => ts.selected = true);
  }
}
