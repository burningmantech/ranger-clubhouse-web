import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class VcApplicationAssignDialogComponent extends Component {
  @service saveModel;

  @tracked isSubmitting;

  assignmentForm;

  constructor() {
    super(...arguments);
    this.assignmentForm = EmberObject.create({
      assigned_person_id: this.args.application.assigned_person_id
    });
  }

  @action
  async submitAssignment(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;
    application.assigned_person_id = model.assigned_person_id;
    if (await this.saveModel.save({model: application, message: 'Assignment update was successful.', owner: this})) {
      this.args.onClose();
    }
  }
}
