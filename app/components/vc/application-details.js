import Component from '@glimmer/component';
import {
  EXPERIENCE_BRC1R1, STATUS_HANDLE_CHECK, STATUS_HOLD_QUALIFICATION_ISSUE, STATUS_HOLD_WHY_RANGER_QUESTION,
  STATUS_REJECT_PRE_BONK, STATUS_REJECT_REGIONAL, STATUS_REJECT_TOO_YOUNG, STATUS_REJECT_UBERBONKED,
  STATUS_REJECT_RETURNING_RANGER,
  STATUS_REJECT_UNQUALIFIED, STATUS_HOLD_RRN_CHECK,
  StatusLabels,
  WHY_VOLUNTEER_REVIEW_OKAY,
  WHY_VOLUNTEER_REVIEW_PROBLEM,
  ExperienceOptions, StatusesThatSendEmail, STATUS_DUPLICATE
} from "clubhouse/models/prospective-application";
import {TYPE_VC_COMMENT} from "clubhouse/models/prospective-application-note";
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import EmberObject, {action} from '@ember/object';
import {htmlSafe} from '@ember/template';
import {validatePresence} from 'ember-changeset-validations/validators';


export default class VcApplicationDetailsComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked messageForm;
  @tracked messageValidation;
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
  statusLabel(status) {
    return StatusLabels[status] ?? `Bug: ${status}`;
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
    this._setupMessageForm('', true);
  }

  @action
  cancelProblemReviewDialog() {
    this.showProblemReviewDialog = false;
  }

  @action
  async submitProblemReview(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;

    try {
      this.isSubmitting = true;
      application.why_volunteer_review = WHY_VOLUNTEER_REVIEW_PROBLEM;
      await application.save();
      await this.ajax.post(`prospective-application/${application.id}/note`, {
        data: {type: TYPE_VC_COMMENT, note: `Why Ranger Review: ${model.message}`}
      });
      await this._reloadApplication();
      this.toast.success('Paragraph marked as problematic.');
      this.showProblemReviewDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  rejectQualification() {
    this._setupToAskMessage(STATUS_REJECT_UNQUALIFIED);
  }

  @action
  rejectRegional() {
    this._setupToAskMessage(STATUS_REJECT_REGIONAL, true);
  }

  @action
  rejectTooYoung() {
    this._setupToAskMessage(STATUS_REJECT_TOO_YOUNG);
  }

  @action
  rejectPreBonk() {
    this._setupToAskMessage(STATUS_REJECT_PRE_BONK);
  }

  @action
  rejectUberbonk() {
    this._setupToAskMessage(STATUS_REJECT_UBERBONKED);
  }

  @action
  rejectDuplicateApplication() {
    this._setupToAskMessage(STATUS_DUPLICATE);
  }

  @action
  rejectReturningRanger() {
    if (this.args.application.isReturningRanger) {
      this._setupToAskMessage(STATUS_REJECT_RETURNING_RANGER);
    } else {
      this.modal.confirm('May not be a Returning Ranger',
        'This application does not appear to be associated with a returning Ranger. Are you absolutely sure you wish to continue?',
        () => this._setupToAskMessage(STATUS_REJECT_RETURNING_RANGER));
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
  whyRangerIssue() {
    this._setupToAskMessage(STATUS_HOLD_WHY_RANGER_QUESTION, true)
  }

  @action
  qualificationIssue() {
    this._setupToAskMessage(STATUS_HOLD_QUALIFICATION_ISSUE);
  }

  @action
  approveForCallsignProcessing() {
    const review = this.args.application.why_volunteer_review;
    if (review !== WHY_VOLUNTEER_REVIEW_OKAY) {
      this.modal.confirm('Paragraph issue',
        `The Why Ranger paragraph status is ${this.args.application.whyVolunteerReviewLabel}. Are you sure you want to clear this application for handle processing?`,
        () => this._submitStatusUpdate(STATUS_HANDLE_CHECK));
    } else {
      this._setupToAskMessage(STATUS_HANDLE_CHECK);
    }
  }

  _setupToAskMessage(status, askForMessage = null, message = '') {
    this.showStatusWithMessageDialog = true;
    this.newStatus = status;
    this.askForMessage = askForMessage;
    this._setupMessageForm(message, askForMessage);
  }

  _setupMessageForm(message, askForMessage) {
    this.messageForm = EmberObject.create({message});
    if (askForMessage) {
      this.messageValidation = {
        message: [validatePresence({presence: true, message: 'Please supply a reason / message.'})]
      }
    } else {
      this.messageValidation = null;
    }
  }

  get doesStatusSendEmail() {
    return StatusesThatSendEmail.includes(this.newStatus);

  }

  @action
  cancelStatusMessageDialog() {
    this.showStatusWithMessageDialog = false;
  }

  @action
  async updateStatusWithMessage(model, isValid) {
    if (!isValid) {
      return;
    }

    await this._submitStatusUpdate(this.newStatus, this.askForMessage ? model.message : null);
  }

  @action
  async previewEmailAction(model) {
    const data = {
      status: this.newStatus,
    };

    if (this.askForMessage) {
      data.message = model.message;
    }

    this.args.previewEmail(data);
  }

  @action
  async _submitStatusUpdate(status, message = null) {
    try {
      const data = {status};
      if (message) {
        data.message = message;
      }
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.args.application.id}/status`, {data});
      await this._reloadApplication();
      this.showStatusWithMessageDialog = false;
      this.toast.success('Status was successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  async _reloadApplication() {
    await this.args.application.reload();
  }
}
