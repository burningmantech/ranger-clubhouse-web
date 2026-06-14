import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {StatusOptions} from "clubhouse/models/prospective-application";

export default class VcApplicationAdjustStatusDialogComponent extends Component {
  @service saveModel;
  @service toast;

  @tracked isSubmitting;

  statusOptions = StatusOptions;

  @action
  async submitStatus(model) {
    if (await this.saveModel.save({model, message: 'Status successfully updated.', owner: this})) {
      this.args.onClose();
    }
  }
}
