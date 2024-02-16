import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {TYPE_VC, TYPE_VC_COMMENT} from "clubhouse/models/prospective-application-note";

export default class VcApplicationNotesComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service toast;

  @tracked editNote;
  @tracked noteForm;
  @tracked showDialog;

  @tracked isSubmitting;

  get notes() {
    const type = this.args.isComment ? TYPE_VC_COMMENT : TYPE_VC;
    return this.args.application.notes.filter((n) => n.type === type);
  }

  @action
  openDialog(note) {
    this.showDialog = true;
    this.editNote = note;
    this.noteForm = EmberObject.create({note: note ? note.note : ''});
  }

  @action
  cancelDialog() {
    this.showDialog = false;
  }

  @action
  async submit(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      this.isSubmitting = true;
      const data = {
        note: model.note,
      };
      if (this.editNote) {
        data.prospective_application_note_id = this.editNote.id;
        await this.ajax.patch(this.url, {data});
      } else {
        data.type = this.args.isComment ? TYPE_VC_COMMENT : TYPE_VC;
        await this.ajax.post(this.url, {data});
      }
      this._reloadApplication();
      this.showDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  deleteNote(note) {
    const name = this.name;
    let prefix = '';
    if (!this.isMyNote(note)) {
      prefix = `<p class="text-danger">Warning: you did not write this ${name}</p>`;
    }
    this.modal.confirm(`Delete ${name}`, `${prefix}Are you sure you want to delete this ${name}?`, async () => {
      try {
        this.isSubmitting = true;
        await this.ajax.delete(this.url, {
          data: {
            prospective_application_note_id: note.id
          }
        });
        this._reloadApplication();
        this.toast.success(`The ${name} was successfully deleted.`);
      } catch (response) {
        this.house.handleErrorResponse(response);
      } finally {
        this.isSubmitting = false;
      }
    });
  }

  get name() {
    return this.args.isComment ? 'comment' : 'note';
  }

  get url() {
    return `prospective-application/${this.args.application.id}/note`;
  }

  @action
  isMyNote(note) {
    return note.person_id === this.session.userId;
  }

  _reloadApplication() {
    this.args.application.reload();
  }
}
