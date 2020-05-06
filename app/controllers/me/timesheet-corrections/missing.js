import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class MeTimesheetCorrectionsMissingController extends Controller {
  entry = null;

  timesheetValidations = {
    on_duty:  [ validateDateTime({ before: 'off_duty' }), validatePresence(true) ],
    off_duty:  [ validateDateTime({ after: 'on_duty' }),validatePresence(true) ],
    notes: [ validatePresence(true) ]
  };

  // Create a list of positions options to check
  @computed('positions')
  get positionOptions() {
      return this.positions.map((p) => [ p.title, p.id ]);
  }

  // Suggest a starting date for the datetime picker when creating
  // a new request.
  @computed('entry', 'timesheetInfo.correction_year')
  get startDateForEntry() {
    const entry = this.entry;

    if (entry.isNew) {
      return `${this.timesheetInfo.correction_year}-08-15`;
    }

    return null;
  }

  // Start a new timesheet missing request
  @action
  newRequestAction() {
    this.set('entry', this.store.createRecord('timesheet-missing', {
      person_id: this.session.userId,
      position_id: this.positions.firstObject.id,
     }));
  }

  // Edit an existing request
  @action
  editAction(timesheetMissing) {
    this.set('entry', timesheetMissing);
  }

  // Cancel the form
  @action
  cancelAction() {
    this.set('entry', null);
  }

  // Save a timesheet missing request
  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    const isNew = model.get('isNew');
    this.set('isSubmitting', true);

    model.save().then(() => {
      this.toast.success(`Your request has been succesfully ${isNew ? 'submitted' : 'updated'}.`);
      this.timesheetsMissing.pushObject(this.entry);
      this.set('entry', null);
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }

  // Delete a request - confirm first before proceeding.
  @action
  deleteAction(timesheetMissing) {
    this.modal.confirm(
      'Are you sure wish to delete this?',
      'You are about to delete the timesheet missing request. Please confirm you want to do this.',
      () => {
        timesheetMissing.destroyRecord().then(() => {
          this.toast.success('The request has been deleted.');
          this.timesheetsMissing.removeObject(timesheetMissing);
        });
      }
    );
  }
}
