import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {
  STATUS_APPROVED,
  STATUS_PII_ISSUE,
  STATUS_HOLD_MORE_HANDLES
} from "clubhouse/models/prospective-application";
import {ReservationTypeLabels} from "clubhouse/models/handle-reservation";

class RejectedHandle {
  @tracked showMessage = false;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

export default class VcApplicationHandlesComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked isSubmitting = false;
  @tracked handlesForm;
  @tracked showMoreHandlesDialog;

  @tracked showEditHandlesListDialog;

  @tracked showEditApprovedHandleDialog;
  @tracked approvedHandleForm;

  @tracked showEditAndApproveCallsign;

  @tracked extractedHandlesForm = null;

  moreHandlesValidation = {
    message: [validatePresence({presence: true, message: 'Please supply a reason / message.'})]
  };

  handlesValidation = {
    handles: [validatePresence({presence: true, message: 'Please enter a list of handles.'})]
  };

  approvedHandleValidation = {
    approved_handle: [validatePresence({presence: true, message: 'Enter the approved handle.'})]
  };

  @action
  openMoreHandlesDialog() {
    this.showMoreHandlesDialog = true;
    this.handlesForm = EmberObject.create({
      message: this.args.application.handles
    })
  }

  @action
  cancelMoreHandlesDialog() {
    this.showMoreHandlesDialog = false;
  }

  @action
  async submitMoreHandles(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;
    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${application.id}/status`, {
        data: {
          status: STATUS_HOLD_MORE_HANDLES,
          message: model.message
        }
      });
      await application.reload();
      this.showMoreHandlesDialog = false;
      this.toast.success('More Handles request successfully submitted.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  openEditHandlesListDialog() {
    this.showEditHandlesListDialog = true;
    this.handlesForm = EmberObject.create({handles: this.args.application.handles});
  }

  @action
  cancelEditHandlesListDialog() {
    this.showEditHandlesListDialog = false;
  }

  @action
  async submitHandlesList(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;

    try {
      this.isSubmitting = true;
      application.handles = model.handles;
      await application.save();
      this.toast.success('The handles list was successfully updated.');
      this.showEditHandlesListDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  openEditApprovedHandleDialog() {
    this.showEditApprovedHandleDialog = true;
    this.approvedHandleForm = EmberObject.create({approved_handle: this.args.application.approved_handle});
  }

  @action
  cancelApprovedHandleDialog() {
    this.showEditApprovedHandleDialog = false;
  }

  @action
  async submitApprovedHandle(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;

    try {
      this.isSubmitting = true;
      application.approved_handle = model.approved_handle;
      await application.save();
      this.toast.success('The accepted handle was successfully updated.');
      this.showEditApprovedHandleDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  openEditAndApproveCallsign() {
    this.showEditAndApproveCallsign = true;
    this.approvedHandleForm = EmberObject.create({approved_handle: this.args.application.approved_handle});
  }

  @action
  cancelEditAndApproveCallsign() {
    this.showEditAndApproveCallsign = false;
  }

  @action
  assignCallsign(handle) {
    this.showEditAndApproveCallsign = true;
    this.approvedHandleForm = EmberObject.create({approved_handle: handle});
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
      }  else {
        this.toast.success('The callsign has been updated and approved.');
      }
      this.showEditAndApproveCallsign = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @cached
  get rejectionsList() {
    return this.args.application.rejected_handles?.map((r) => new RejectedHandle(r));
  }

  @action
  toggleRejectionMessage(rejection) {
    rejection.showMessage = !rejection.showMessage;
  }

  reservedHandleType(type) {
    return ReservationTypeLabels[type] ?? `Bug: ${type}`;
  }

  @action
  async extractHandles() {
    try {
      this.isSubmitting = true;
      const { handles } = await this.ajax.request(`prospective-application/handles-extract`, { data: { text: this.args.application.handles}});
      this.extractedHandlesForm = EmberObject.create({ handles: handles.join("\n") });
    } catch(response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancelExtractedHandles() {
    this.extractedHandlesForm = null;
  }

  @action
  async saveExtractedHandles(model) {
    try {
      this.isSubmitting = true;
      const { application } = this.args;
      application.handles = model.handles;
      await application.save();
      this.toast.success('The handles has been saved successfully.');
      this.extractedHandlesForm = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
