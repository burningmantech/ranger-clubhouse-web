import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';

import validateDateTime from 'clubhouse/validators/datetime';

export default class MeTimesheetMissingController extends Controller {
  timesheetsMissing = [];
  editTimesheetMissing = null;

  timesheetValidations = {
    on_duty:  [ validateDateTime({ before: 'off_duty'}), validatePresence({ presence: true })],
    off_duty:  [ validateDateTime({ after: 'on_duty'}),validatePresence({ presence: true })],
    notes: validatePresence({ presence: true })
  };

  // Create a list of positions options to check
  @computed('positions')
  get positionOptions() {
      return this.positions.map((p) => [ p.title, p.id ]);
  }

  @action
  newRequestAction() {
    this.set('editTimesheetMissing', this.store.createRecord('timesheet-missing', {
      person_id: this.session.user.id,
      position_id: this.positions.firstObject.id,
     }));
  }

  @action
  editAction(timesheetMissing) {
    this.set('editTimesheetMissing', timesheetMissing);
  }

  @action
  cancelAction() {
    this.set('editTimesheetMissing', null);
  }

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    const isNew = model.get('isNew');
    this.set('isSubmitting', true);
    model.save().then(() => {
      this.toast.success(`Your request has been succesfully ${isNew ? 'submitted' : 'updated'}.`);
      this.set('editTimesheetMissing', null);
      this.timesheetsMissing.update();  // Refresh the results.
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => { this.set('isSubmitting', false) });
  }

  @action
  deleteAction(timesheetMissing) {
    this.modal.confirm(
      'Are you sure wish to delete this?',
      'You are about to delete the timesheet missing request. Please confirm you want to do this.',
      () => {
        timesheetMissing.destroyRecord().then(() => {
          this.toast.success('The request has been deleted.');
          this.timesheetsMissing.update();
        });
      }
    );
  }
}
