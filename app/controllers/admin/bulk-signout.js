import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';

export default class AdminBulkSignoutController extends Controller {
  @computed('timesheets.@each.selected')
  get selectedCount() {
    return this.timesheets.reduce((total, ts) => (ts.selected ? 1 : 0) + total, 0);
  }

  @computed('timesheets.@each.off_duty')
  get onDutyCount() {
    return this.timesheets.reduce((total, ts) => (ts.off_duty ? 0 : 1) + total, 0);
  }

  @action
  toggleAll(selected) {
    this.set('selectAll', selected);
    this.timesheets.forEach((ts) => set(ts, 'selected', selected));
  }

  @action
  signoffAction() {
    this.timesheets.filter((ts) => ts.selected).forEach(async (ts) => {
      await this.ajax.request(`timesheet/${ts.id}/signoff`, { method: 'POST' }).then((result) => {
        const entry = result.timesheet;
        set(ts, 'off_duty', entry.off_duty);
        set(ts, 'duration', entry.duration);
        set(ts, 'credits', entry.credits);
        set(ts, 'selected', false);
      }).catch((response) => this.house.handleErrorResponse(response));
    });
    this.toast.success('Timesheet entry(s) have been signed out');
  }
}
