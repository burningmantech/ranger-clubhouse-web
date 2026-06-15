import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class VcApplicationEditApprovedHandleDialogComponent extends Component {
  @service saveModel;
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
    application.approved_handle = model.approved_handle;
    if (await this.saveModel.save({model: application, message: 'The accepted handle was successfully updated.', owner: this})) {
      this.args.onClose();
    }
  }
}
