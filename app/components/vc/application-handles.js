import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
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

  @tracked isSubmitting = false;
  @tracked showMoreHandlesDialog;
  @tracked showEditHandlesListDialog;
  @tracked showEditApprovedHandleDialog;
  @tracked showEditAndApproveCallsign;
  @tracked approveCallsignHandle;
  @tracked extractedHandlesForm = null;

  @action
  openMoreHandlesDialog() {
    this.showMoreHandlesDialog = true;
  }

  @action
  cancelMoreHandlesDialog() {
    this.showMoreHandlesDialog = false;
  }

  @action
  openEditHandlesListDialog() {
    this.showEditHandlesListDialog = true;
  }

  @action
  cancelEditHandlesListDialog() {
    this.showEditHandlesListDialog = false;
  }

  @action
  openEditApprovedHandleDialog() {
    this.showEditApprovedHandleDialog = true;
  }

  @action
  cancelApprovedHandleDialog() {
    this.showEditApprovedHandleDialog = false;
  }

  @action
  openEditAndApproveCallsign() {
    this.approveCallsignHandle = null;
    this.showEditAndApproveCallsign = true;
  }

  @action
  cancelEditAndApproveCallsign() {
    this.showEditAndApproveCallsign = false;
  }

  @action
  assignCallsign(handle) {
    this.approveCallsignHandle = handle;
    this.showEditAndApproveCallsign = true;
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
    const {application} = this.args;
    try {
      this.isSubmitting = true;
      const {handles} = await this.ajax.request(`prospective-application/handles-extract`, {data: {text: application.handles}});
      this.extractedHandlesForm = EmberObject.create({handles: handles.map((h) => h[0]).join("\n") });
      application.problem_handles = handles.filter((h) => h[1].length > 0).map((h) => ({ handle: h[0], problems: h[1]}));
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancelExtractedHandles() {
    this.extractedHandlesForm = null;
  }
}
