/*
 * Shared by me/timesheet and hq/timesheet
 */

import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {inject as service} from '@ember/service';
import {DIRT} from 'clubhouse/constants/positions';
import validateDateTime from 'clubhouse/validators/datetime';
import {tracked} from '@glimmer/tracking';

export default class MeTimesheetMissingCommonComponent extends Component {
  @service store;
  @service toast;
  @service house;
  @service modal;

  @tracked entry = null;
  @tracked isSubmitting = false;

  timesheetValidations = {
    on_duty: [validateDateTime({before: 'off_duty'}), validatePresence(true)],
    off_duty: [validateDateTime({after: 'on_duty'}), validatePresence(true)],
    additional_notes: [validatePresence(true)]
  };

  // Create a list of positions options to check
  constructor() {
    super(...arguments);

    const positions = this.args.positions.map((p) => [p.title, p.id]);
    const dirt = positions.find((p) => p[1] === DIRT);
    if (dirt) {
      positions.removeObject(dirt);
      positions.unshift(dirt);
    }

    this.positionOptions = positions;
  }

  // Suggest a starting date for the datetime picker when creating
  // a new request.
  get startDateForEntry() {
    const entry = this.entry;

    if (entry.isNew) {
      return `${this.args.timesheetInfo.correction_year}-08-15`;
    }

    return null;
  }

  // Start a new timesheet missing request
  @action
  newRequestAction() {
    this.entry = this.store.createRecord('timesheet-missing', {
      person_id: this.args.person.id,
      position_id: this.positionOptions[0][1],
    });
  }

  // Edit an existing request
  @action
  editAction(timesheetMissing) {
    timesheetMissing.reload().then(() => {
      if (timesheetMissing.isApproved) {
        this.modal.info('Missing Timesheet Entry Request Approved!', 'Hold up! The timesheet entry has been approved since this page has been refreshed.');
        return;
      }
      this.entry = timesheetMissing;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Cancel the form
  @action
  cancelAction() {
    this.entry = null;
  }

  // Save a timesheet missing request
  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    if (!model.isDirty) {
      this.entry = null;
      this.modal.info('', `You did not enter any ${isNew ? 'new' : ''} information.`);
      return;
    }

    this.isSubmitting = true;

    model.save().then(() => {
      this.toast.success(`Your request has been successfully ${isNew ? 'submitted' : 'updated'}.`);
      if (isNew) {
        this.args.timesheetsMissing.update();
      }
      this.entry = null;
      set(this.args.timesheetInfo, 'timesheet_confirmed', false);
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  // Delete a request - confirm first before proceeding.
  @action
  deleteAction(timesheetMissing) {
    this.modal.confirm(
      'Are you sure wish to delete this?',
      'You are about to delete the timesheet missing request. Please confirm you want to do this.',
      () => timesheetMissing.destroyRecord().then(() => this.toast.success('The request has been deleted.'))
    );
  }
}
