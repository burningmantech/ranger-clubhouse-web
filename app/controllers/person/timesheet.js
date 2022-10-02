import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class PersonTimesheetController extends ClubhouseController {
  queryParams = ['year'];

  @tracked timesheetSummary;
  @tracked onDutyEntry;

  @action
  onTimesheetChange() {
    this._updateTimesheetSummary();
  }

  _updateTimesheetSummary() {
    this.ajax.request(`person/${this.person.id}/timesheet-summary`, {data: {year: this.year}})
      .then((result) => this.timesheetSummary = result.summary);
  }

  get timesheetPendingCount() {
    return this.timesheets.filter((t) => t.isPending).length;
  }

  get missingRequestPendingCount() {
    return this.timesheetMissing.filter((t) => t.isPending).length;
  }

  @action
  startShiftNotify() {
    this.timesheets.update().then(() => this._findOnDuty());
  }

  @action
  endShiftNotify() {
    this.timesheets.update().then(() => this._findOnDuty());
    this._updateTimesheetSummary();
  }

  _findOnDuty() {
    this.onDutyEntry = this.timesheets.find((t) => t.off_duty == null);
  }
}
