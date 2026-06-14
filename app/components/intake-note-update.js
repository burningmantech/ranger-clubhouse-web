import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';

export default class IntakeNoteUpdateComponent extends Component {
  @service ajax;
  @service errors;
  @service toast;

  @action
  async updateNote(model) {
    try {
      await this.ajax.request(`intake/${this.args.note.id}/update-note`, {
        method: 'POST',
        data: {
          note: model.note
        }
      });
      set(this.args.note, 'note', model.note);
      this.toast.success('The note was successfully updated.');
      this.args.closeAction();
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }
}
