import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';

export default class PersonTimesheetController extends ClubhouseController {
  queryParams = ['year'];

  @tracked timesheetSummary;
  @tracked onDutyEntry;
  @tracked timesheetInfo;
  @tracked positions;
  @tracked eventInfo;
  @tracked timesheetMissing;
  @tracked isSubmitting = false;

  @action
  onTimesheetChange() {
    this._updateTimesheetSummary();
  }

  _updateTimesheetSummary() {
    this.ajax.request(`person/${this.person.id}/timesheet-summary`, {data: {year: this.year}})
      .then((result) => this.timesheetSummary = result.summary)
      .catch((response) => this.house.handleErrorResponse(response));

    this.ajax.request('timesheet/info', {data: {person_id: this.person.id}})
      .then((result) => this.timesheetInfo = result.info)
      .catch((response) => this.house.handleErrorResponse(response));
  }

  get canForceConfirmation() {
    return this.session.hasRole(TECH_NINJA);
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

  @action
  confirmTimesheetAction() {
    const confirmed = this.timesheetInfo.timesheet_confirmed ? 0 : 1;
    this.modal.confirm(`${confirmed ? 'Confirm' : 'Un-confirm'} Timesheet?`,
      `Are you sure you want to ${confirmed ? 'CONFIRM' : 'UN-CONFIRM'} the timesheet? The action will be logged.`,
      () => {
        this.isSubmitting = true;
        this.ajax.request('timesheet/confirm', {
          method: 'POST',
          data: {person_id: this.person.id, confirmed}
        }).then((result) => {
          const {timesheet_confirmed, timesheet_confirmed_at} = result.confirm_info;
          this.timesheetInfo = {
            ...this.timesheetInfo,
            timesheet_confirmed,
            timesheet_confirmed_at
          };
          this.toast.success(`Timesheet has been ${timesheet_confirmed ? 'CONFIRMED' : 'UN-CONFIRMED'}`);
        }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isSubmitting = false);
      });
  }

  _findOnDuty() {
    this.onDutyEntry = this.timesheets.find((t) => t.off_duty == null);
  }
}
