import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {StatusOptions} from "clubhouse/models/prospective-application";

export default class VcApplicationAdjustStatusDialogComponent extends Component {
  @service house;
  @service toast;

  @tracked isSubmitting;

  statusOptions = StatusOptions;

  @action
  async submitStatus(model) {
    try {
      this.isSubmitting = true;
      await model.save();
      this.toast.success('Status successfully updated.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }
}
