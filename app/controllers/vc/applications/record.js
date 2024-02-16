import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import {
  StatusLabels,
  StatusOptions,
  StatusColors,
  STATUS_DUPLICATE,
} from "clubhouse/models/prospective-application";

export default class VcApplicationsRecordController extends ClubhouseController {
  @tracked application;
  @tracked related;
  @tracked relatedApplications;

  @tracked showSendEmailDialog;

  @tracked emailForm;

  @tracked showAssignDialog;
  @tracked assignmentForm;

  @tracked VCs;

  @tracked showStatusDialog;

  @tracked initialTabId;

  emailValidation = {
    subject: [validatePresence({presence: true, message: "Please supply a subject."})],
    message: [validatePresence({presence: true, message: "Please supply a message to the applicant."})],
  }

  statusOptions = StatusOptions;

  /**
   * Is the application not for the current year?
   *
   * @returns {boolean}
   */

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

  /**
   * Is this application assigned to the current user?
   *
   * @returns {boolean}
   */

  get isAssignedToMe() {
    return this.application.assigned_person_id === this.session.userId;
  }

  /**
   * Is the application assigned to someone else?
   *
   * @returns {string|*|boolean}
   */

  get assignedToOther() {
    return this.application.assigned_person_id && this.application.assigned_person_id !== this.session.userId;
  }

  /**
   * Did the applicant submit multiple/duplicate applications for the current event?
   *
   * @returns {boolean}
   */

  get haveDuplicateApplications() {
    return this.relatedApplications.filter((a) => a.year === this.application.year && a.status !== STATUS_DUPLICATE).length > 0;
  }

  /**
   * Provide a list of V.C.s to assign the application to.
   *
   * @returns {[]}
   * @constructor
   */

  get VCOptions() {
    const options = this.VCs.map((v) => [v.callsign, v.id]);
    options.unshift(['- Unassigned -', null]);

    return options;
  }

  /**
   * Assign this application to the current user
   */

  @action
  assignToSelf() {
    this.assignApplication(this.session.userId, 'The application successfully assigned to you.');
  }

  /**
   * Clear the application assignment.
   */

  @action
  unassignApplication() {
    this.assignApplication(null, 'Application is now unassigned.');
  }

  /**
   * Open the dialog to assign the application to.
   */

  @action
  openAssignDialog() {
    this.showAssignDialog = true;
    this.assignmentForm = EmberObject.create({assigned_person_id: this.application.assigned_person_id});
  }

  @action
  cancelAssignDialog() {
    this.showAssignDialog = false;
  }

  /**
   * Try to assign the application to a specific V.C.
   *
   * @param model
   * @param isValid
   * @returns {Promise<void>}
   */

  @action
  async submitAssignment(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      this.isSubmitting = true;
      this.application.assigned_person_id = model.assigned_person_id;
      await this.application.save();
      this.toast.success('Assignment update was successful.');
      this.showAssignDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Assign to a given person.
   *
   * @param personId
   * @param successMessage
   * @returns {Promise<void>}
   */

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
  statusLabel(status) {
    return StatusLabels[status] ?? `Bug: ${status}`;
  }

  @action
  statusColor(status) {
    return StatusColors[status];
  }

  @action
  openSendEmailDialog() {
    this.showSendEmailDialog = true;
    this.emailForm = EmberObject.create({
      subject: `Hey ${this.application.first_name}, we have a question about your Ranger application`,
      message: `Hey ${this.application.first_name} ${this.application.last_name},\n\n*insert your message here*\n\nYour Friendly Black Rock Ranger Volunteer Coordinators
`
    });
  }

  @action
  cancelSendEmailDialog() {
    this.showSendEmailDialog = false;
  }

  @action
  async sendEmail(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.application.id}/send-email`, {
        data: {subject: model.subject, message: model.message}
      });
      await this.application.reload();
      this.toast.success('Email was sent.');
      this.showSendEmailDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
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
  async submitStatus(model) {
    try {
      this.isSubmitting = true;
      await model.save();
      this.toast.success('Status successfully updated.');
      this.showStatusDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
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
}
