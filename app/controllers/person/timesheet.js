import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYearAction(year) {
    this.set('year', year);
  }

  @action
  updateTimesheetSummary() {
    this.ajax.request(`person/${this.person.id}/schedule/summary`, { data: { year: this.year }}).then((result) => {
      this.set('timesheetSummary', result.summary);
    });
  }
}
