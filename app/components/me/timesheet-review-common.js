import Component from '@glimmer/component';
import { action } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MeTimesheetReviewCommonComponent extends Component {
  @service toast;
  @service session;

  @tracked entry = null; // Incorrect entry

  correctionValidations = {
    notes: [validatePresence({ presence: true })]
  };

  get isMe() {
    return this.session.userId == this.args.person.id;
  }

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.verified = 1;
    timesheet.save().then(() => {
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => {
      timesheet.rollbackAttributes();
      this.house.handleErrorResponse(response, timesheet);
    });
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    timesheet.reload().then(() => {
      this.entry = timesheet;
    }).catch((response) => this.house.handleErrorResponse(response, timesheet))
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    if (!model.isDirty) {
      this.modal.info('Enter More Information', 'You did not add to the correction note.');
      return;
    }

    model.verified = 0;

    model.save().then(() => {
      this.entry = null;
      if (this.timesheetInfo) {
        this.timesheetInfo.timesheet_confirmed =  0;
      }
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.entry = null;
  }
}
