import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {cached,tracked} from '@glimmer/tracking';
import positionsForTimesheetMissing from "clubhouse/utils/positions-for-timesheet-missing";

export default class MeTimesheetMissingCommonComponent extends Component {
  @service house;
  @service modal;
  @service session;
  @service shiftManage;
  @service store;
  @service toast;

  @tracked entry = null;

  @cached
  get positionOptions() {
    return positionsForTimesheetMissing(this.args.positions);
  }

  get isMe() {
    return +this.args.person.id === this.session.userId;
  }

  /**
   * Start a new timesheet missing request
   */

  @action
  newRequestAction() {
    this.entry = this.store.createRecord('timesheet-missing', {
      person_id: this.args.person.id,
      position_id: this.positionOptions[0][1],
    });
  }

  /**
   * Edit an existing request
   * @param {TimesheetMissingModel} timesheetMissing
   */

  @action
  async editAction(timesheetMissing) {
    try {
      await timesheetMissing.reload();
      if (timesheetMissing.isApproved) {
        this.modal.info(
          'Missing Timesheet Entry Request Approved!',
          'Hold up! The timesheet entry has been approved since this page has been refreshed.');
        return;
      }
      this.entry = timesheetMissing;

    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  toggleNotes(tsm) {
    tsm.showNotes = !tsm.showNotes;
  }

  /**
   * Cancel the form
   */

  @action
  cancelAction() {
    this.entry = null;
  }

  @action
  saveAction(isNew) {
    if (isNew) {
      this.args.timesheetsMissing.update();
    }
    this.entry = null;
    set(this.args.timesheetInfo, 'timesheet_confirmed', false);
  }

  /**
   * Delete a missing entry request, confirm before proceeding.
   * @param {TimesheetMissingModel} timesheetMissing
   */

  @action
  deleteAction(timesheetMissing) {
    this.modal.confirm(
      'Are you sure wish to delete this?',
      'You are about to delete the timesheet missing request. Please confirm you want to do this.',
      () => timesheetMissing.destroyRecord().then(() => this.toast.success('The request has been deleted.'))
    );
  }

  /**
   * Helper to color the row header. (aka entry status header)
   *
   * @param {TimesheetMissingModel} ts
   * @returns {string}
   */

  requestClass(ts) {
    if (ts.isApproved) {
      return 'text-success';
    }

    if (ts.isRejected) {
      return 'text-bg-danger';
    }

    if (ts.isPending) {
      return 'text-bg-warning';
    }

    return ''
  }
}
