import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {STATUS_PENDING, STATUS_VERIFIED} from "clubhouse/models/timesheet";
import currentYear from 'clubhouse/utils/current-year';

export default class MeTimesheetReviewCommonComponent extends Component {
  @service toast;
  @service session;

  @tracked entry = null; // Incorrect entry

  correctionValidations = {
    additional_notes: [validatePresence({presence: true})]
  };

  get correctionsEnabled() {
    return this.args.year === currentYear() && this.args.timesheetInfo.correction_enabled;
  }

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.review_status = STATUS_VERIFIED;
    timesheet.save().then(() => {
      this.args.onVerified?.();
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    this.entry = timesheet;
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.review_status = STATUS_PENDING;
    model.save().then(() => {
      this.entry = null;
      this.args.onUpdate?.();
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.entry = null;
  }

  timesheetRowClass(ts) {
    if (ts.stillOnDuty) {
      return 'text-danger';
    }

    if (ts.isVerified) {
      return 'text-success'
    }

    if (ts.isUnverified) {
      return 'text-bg-warning';
    }

    if (ts.isApproved) {
      return 'text-bg-danger';
    }

    if (ts.isRejected) {
      return 'text-bg-secondary';
    }

    if (ts.isPending) {
      return 'text-bg-secondary';
    }

    return ''
  }
}
