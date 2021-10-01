import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

class TimesheetOption {
  @tracked selected = false;

  constructor(obj) {
    Object.assign(this,obj);
  }
}

export default class AdminBulkSignoutController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked signOffTimesheet = null;
  @tracked selectAll = false;

  buildTimesheets(timesheets) {
    this.timesheets = timesheets.map((t) => {
      const ts = new TimesheetOption(t);
      ts.selected = true;
      return ts;
    });
  }

  get selectedCount() {
    return this.timesheets.reduce((total, ts) => (ts.selected ? 1 : 0) + total, 0);
  }

  get onDutyCount() {
    return this.timesheets.reduce((total, ts) => (ts.off_duty ? 0 : 1) + total, 0);
  }

  @action
  toggleAll(event) {
    const selected = event.target.checked;
    this.selectAll = selected;
    this.timesheets.forEach((ts) => ts.selected = selected);
  }

  @action
  async signoffAction() {
    this.isSubmitting = true;
    const selected = this.timesheets.filter((ts) => ts.selected);

    for (let i = 0; i < selected.length; i++) {
      const ts = selected[i];
      try {
        this.signOffTimesheet = ts;
        const result = await this.ajax.request(`timesheet/${ts.id}/signoff`, {method: 'POST'});
        const entry = result.timesheet;
        set(ts, 'off_duty', entry.off_duty);
        set(ts, 'duration', entry.duration);
        set(ts, 'credits', entry.credits);
        set(ts, 'selected', false);
      } catch (response) {
        this.house.handleErrorResponse(response);
      } finally {
        this.signOffTimesheet = null;
      }
    }

    this.isSubmitting = false;
    this.toast.success('Timesheet entry(s) have been signed out');
  }
}
