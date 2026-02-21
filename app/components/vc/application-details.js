import Component from '@glimmer/component';
import {
  EXPERIENCE_BRC1R1, STATUS_HANDLE_CHECK,
  STATUS_REJECT_RETURNING_RANGER, STATUS_HOLD_RRN_CHECK,
  WHY_VOLUNTEER_REVIEW_OKAY,
  ExperienceOptions,
} from "clubhouse/models/prospective-application";
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {htmlSafe} from '@ember/template';


export default class VcApplicationDetailsComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked askForMessage;
  @tracked newStatus;

  @tracked isSubmitting;

  @tracked showStatusWithMessageDialog;
  @tracked showProblemReviewDialog;

  experienceOptions = ExperienceOptions;

  @cached
  get eventYearOptions() {
    const years = [];
    for (let i = 1986; i <= this.house.currentYear(); i++) {
      years.push(i);
    }

    return years;
  }

  @action
  async saveApplication(model, isValid) {
    if (!isValid) {
      return false;
    }

    try {
      this.isSubmitting = true;
      await model.save();
      this.toast.success('Application details successfully updated.');
      return true;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }

    return false;
  }

  @action
  async setReviewOkay() {
    const {application} = this.args;
    try {
      application.why_volunteer_review = WHY_VOLUNTEER_REVIEW_OKAY;
      this.isSubmitting = true;
      await application.save();
      this.toast.success('Paragraph marked okay.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  openProblemReviewDialog() {
    this.showProblemReviewDialog = true;
  }

  @action
  cancelProblemReviewDialog() {
    this.showProblemReviewDialog = false;
  }

  @action
  openStatusAction(status, askForMessage = null) {
    this.showStatusWithMessageDialog = true;
    this.newStatus = status;
    this.askForMessage = askForMessage;
  }

  @action
  cancelStatusMessageDialog() {
    this.showStatusWithMessageDialog = false;
  }

  @action
  rejectReturningRanger() {
    if (this.args.application.isReturningRanger) {
      this.openStatusAction(STATUS_REJECT_RETURNING_RANGER);
    } else {
      this.modal.confirm('May not be a Returning Ranger',
        'This application does not appear to be associated with a returning Ranger. Are you absolutely sure you wish to continue?',
        () => this.openStatusAction(STATUS_REJECT_RETURNING_RANGER));
    }
  }

  @action
  requestRRNCheck() {
    let message = '';
    if (this.args.application.experience !== EXPERIENCE_BRC1R1) {
      message = '<p>Note: the experience field does NOT state the individual has Regional Ranger experience. A RRN Check may not be appropriate at this time.</p>'
    }
    this.modal.confirm('Request RRN Check', htmlSafe(`${message} Are you sure you want to initiate a RRN check?`), () => {
      this._submitStatusUpdate(STATUS_HOLD_RRN_CHECK);
    })
  }

  @action
  approveForCallsignProcessing() {
    const review = this.args.application.why_volunteer_review;
    if (review !== WHY_VOLUNTEER_REVIEW_OKAY) {
      this.modal.confirm('Paragraph issue',
        `The Why Ranger paragraph status is ${this.args.application.whyVolunteerReviewLabel}. Are you sure you want to clear this application for handle processing?`,
        () => this._submitStatusUpdate(STATUS_HANDLE_CHECK));
    } else {
      this.openStatusAction(STATUS_HANDLE_CHECK);
    }
  }

  async _submitStatusUpdate(status, message = null) {
    try {
      const data = {status};
      if (message) {
        data.message = message;
      }
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.args.application.id}/status`, {data});
      await this.args.application.reload();
      this.showStatusWithMessageDialog = false;
      this.toast.success('Status was successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
