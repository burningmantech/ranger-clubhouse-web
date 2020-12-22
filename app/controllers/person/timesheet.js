import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class PersonTimesheetController extends Controller {
  queryParams = ['year'];
  @tracked timesheetSummary;

  @action
  updateTimesheetSummary() {
    this.ajax.request(`person/${this.person.id}/timesheet-summary`, {data: {year: this.year}})
      .then((result) => this.timesheetSummary = result.summary);
  }

  get timesheetPendingCount() {
    return this.timesheets.filter((t) => t.isPending).length;
  }

  get missingRequestPendingCount() {
    return this.timesheetMissing.filter((t) => t.isPending).length;
  }
}
