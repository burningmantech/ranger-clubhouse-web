import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import positionsForTimesheetMissing from "clubhouse/utils/positions-for-timesheet-missing";

export default class MeTimesheetMissingCommonComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service shiftManage;
  @service store;
  @service toast;

  @tracked entry = null;
  @tracked positionOptions;
  @tracked isLoading = false;

  constructor() {
    super(...arguments);
    this._loadPositions();
  }

  async _loadPositions() {
    try {
      this.isLoading = true;
      const {positions} = await this.ajax.request(`person/${this.args.person.id}/positions`, {
        data:
          {include_past_grants: 1, exclude_trainee: 1}
      });
      this.positionOptions = positionsForTimesheetMissing(positions);

    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  get isMe() {
    return +this.args.person.id === this.session.userId;
  }

  /**
   * Start a new timesheet missing request
   */

  @action
  newRequestAction() {
    this.entry = this.store.createRecord('timesheet-missing', {});
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
  async saveAction(isNew) {
    if (isNew) {
      try {
        await this.args.timesheetsMissing.update();
      } catch (response) {
        this.house.handleErrorResponse(response);
      }
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
      async () => {
        try {
          await timesheetMissing.destroyRecord();
          this.toast.success('The request has been deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      }
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
