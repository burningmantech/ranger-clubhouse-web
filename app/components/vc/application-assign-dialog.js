import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class VcApplicationAssignDialogComponent extends Component {
  @service house;
  @service toast;

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

    try {
      this.isSubmitting = true;
      this.args.application.assigned_person_id = model.assigned_person_id;
      await this.args.application.save();
      this.toast.success('Assignment update was successful.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
