import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class EditableSectionComponent extends Component {
  @tracked isEditing = false;

  @action
  async onSubmit(model, isValid) {
    const result = await this.args.onSubmit(model, isValid);

    if (!result) {
      return;
    }

    this.isEditing = false;
  }

  @action
  editAction() {
    this.isEditing = true;
  }

  @action
  cancelEdit() {
    this.isEditing = false;
  }
}
