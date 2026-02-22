import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  STATUS_DUPLICATE,
  STATUS_HANDLE_CHECK,
  STATUS_REJECT_RETURNING_RANGER,
  WHY_VOLUNTEER_REVIEW_OKAY,
} from "clubhouse/models/prospective-application";

export default class VcApplicationsRecordController extends ClubhouseController {
  @tracked application;
  @tracked relatedApplications;

  @tracked showSendEmailDialog;
  @tracked showAssignDialog;
  @tracked showStatusDialog;
  @tracked showStatusWithMessageDialog;
  @tracked newStatus;
  @tracked askForMessage;

  @tracked VCs;

  get notCurrentYear() {
    return this.application.year !== this.house.currentYear();
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return false;
    }

    try {
      await model.save();
      this.toast.success('Application successfully saved.');
      return true;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    }
  }

  get isAssignedToMe() {
    return this.application.assigned_person_id === this.session.userId;
  }

  get assignedToOther() {
    return this.application.assigned_person_id && this.application.assigned_person_id !== this.session.userId;
  }

  get haveDuplicateApplications() {
    return this.relatedApplications.filter((a) => a.year === this.application.year && a.status !== STATUS_DUPLICATE).length > 0;
  }

  get VCOptions() {
    const options = this.VCs.map((v) => [v.callsign, v.id]);
    options.unshift(['- Unassigned -', null]);

    return options;
  }

  @action
  assignToSelf() {
    this.assignApplication(this.session.userId, 'The application successfully assigned to you.');
  }

  @action
  unassignApplication() {
    this.assignApplication(null, 'Application is now unassigned.');
  }

  @action
  openAssignDialog() {
    this.showAssignDialog = true;
  }

  @action
  cancelAssignDialog() {
    this.showAssignDialog = false;
  }

  @action
  async assignApplication(personId, successMessage) {
    try {
      this.application.assigned_person_id = personId;
      await this.application.save();
      this.toast.success(successMessage);
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  openSendEmailDialog() {
    this.showSendEmailDialog = true;
  }

  @action
  cancelSendEmailDialog() {
    this.showSendEmailDialog = false;
  }

  @action
  openStatusDialog() {
    this.showStatusDialog = true;
  }

  @action
  cancelStatusDialog() {
    this.showStatusDialog = false;
  }

  @action
  deleteApplication() {
    this.modal.confirm('Delete Application',
      'Are you absolutely sure you want to delete this application?',
      async () => {
        try {
          this.isSubmitting = true;
          await this.application.destroyRecord();
          this.toast.success('Application was successfully deleted.');
          this.router.transitionTo('vc.applications.index', {queryParams: {year: this.application.year}});
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
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
  approveForCallsignProcessing() {
    const review = this.application.why_volunteer_review;
    if (review !== WHY_VOLUNTEER_REVIEW_OKAY) {
      this.modal.confirm('Paragraph issue',
        `The Why Ranger paragraph status is ${this.application.whyVolunteerReviewLabel}. Are you sure you want to clear this application for handle processing?`,
        () => this._submitStatusUpdate(STATUS_HANDLE_CHECK));
    } else {
      this.openStatusAction(STATUS_HANDLE_CHECK);
    }
  }

  @action
  rejectReturningRanger() {
    if (this.application.isReturningRanger) {
      this.openStatusAction(STATUS_REJECT_RETURNING_RANGER);
    } else {
      this.modal.confirm('May not be a Returning Ranger',
        'This application does not appear to be associated with a returning Ranger. Are you absolutely sure you wish to continue?',
        () => this.openStatusAction(STATUS_REJECT_RETURNING_RANGER));
    }
  }

  async _submitStatusUpdate(status, message = null) {
    try {
      const data = {status};
      if (message) {
        data.message = message;
      }
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.application.id}/status`, {data});
      await this.application.reload();
      this.showStatusWithMessageDialog = false;
      this.toast.success('Status was successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
