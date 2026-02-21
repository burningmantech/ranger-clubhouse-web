import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {STATUS_APPROVED, STATUS_PII_ISSUE} from "clubhouse/models/prospective-application";

export default class VcApplicationApproveCallsignDialogComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked isSubmitting;

  approvedHandleForm;

  approvedHandleValidation = {
    approved_handle: [validatePresence({presence: true, message: 'Enter the approved handle.'})]
  };

  constructor() {
    super(...arguments);
    this.approvedHandleForm = EmberObject.create({
      approved_handle: this.args.initialHandle ?? this.args.application.approved_handle
    });
  }

  @action
  async submitHandleAndApprove(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;

    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${application.id}/status`, {
        data: {
          status: application.hasPersonalInfoIssues ? STATUS_PII_ISSUE : STATUS_APPROVED,
          approved_handle: model.approved_handle,
        }
      });
      await application.reload();
      if (application.hasPersonalInfoIssues) {
        this.modal.info('Personal Information Issue',
          'The application is on hold because one or more Personal Info fields are blank. While the callsign has been approved, the applicant has not been notified of the assignment. An email has been sent asking for the missing info. Once they respond, the application should be updated and approved.');
      } else {
        this.toast.success('The callsign has been updated and approved.');
      }
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
