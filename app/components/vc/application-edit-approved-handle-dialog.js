import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class VcApplicationEditApprovedHandleDialogComponent extends Component {
  @service house;
  @service toast;

  @tracked isSubmitting;

  approvedHandleForm;

  constructor() {
    super(...arguments);
    this.approvedHandleForm = EmberObject.create({
      approved_handle: this.args.application.approved_handle
    });
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
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
