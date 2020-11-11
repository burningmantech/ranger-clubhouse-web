import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @action
  updateTimesheetSummary() {
    this.ajax.request(`person/${this.person.id}/timesheet-summary`, { data: { year: this.year }}).then((result) => {
      this.set('timesheetSummary', result.summary);
    });
  }

  get timesheetPendingCount() {
    return this.timesheets.filter((t) => t.isPending).length;
  }

  get missingRequestPendingCount() {
    return this.timesheetMissing.filter((t) => t.isPending).length;
  }
}
