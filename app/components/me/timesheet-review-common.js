import Component from '@ember/component';
import { action } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetReviewCommonComponent extends Component {
  @argument('object') timesheets;
  @argument(optional('object')) timesheetInfo;
  @argument(optional('object')) timesheetSummary;

  entry = null; // Incorrect entry

  correctionValidations = {
    notes: validatePresence({ presence: true})
  };

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.set('verified', 1);
    this.toast.clear();
    timesheet.save().then(() => {
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    this.set('entry', timesheet);
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();
    model.set('verified', 0);
    model.save().then(() => {
      this.set('entry', null);
      if (this.timesheetInfo) {
        this.set('timesheetInfo.timesheet_confirmed', 0);
      }
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.set('entry', null);
  }
}
