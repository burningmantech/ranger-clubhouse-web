import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {ADMIN, INTAKE, MENTOR, VC} from 'clubhouse/constants/roles';
import {service} from '@ember/service';

export default class IntakeNotesComponent extends Component {
  @tracked addingNotes;
  @tracked updateNote;

  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service toast;


  get teamNotes() {
    // Might be updated at any time.
    return this.args.person[this.args.type + '_team'];
  }

  // Is the user allowed to add a team note?
  get canAddNote() {
    let role;

    if (!this.args.onSubmit) {
      return false;
    }

    switch (this.args.type) {
      case 'mentor':
        role = MENTOR;
        break;
      case 'vc':
        role = VC;
        break;
      case 'personnel':
        role = ADMIN;
        break;
      default:
        role = INTAKE;
        break;
    }

    return this.session.hasRole(role);
  }

  @action
  addNoteAction() {
    this.addingNotes = true;
  }

  @action
  closeNoteAction() {
    this.addingNotes = false;
  }

  @action
  updateNoteAction(note) {
    this.updateNote = note;
  }

  @action
  closeUpdateNote() {
    this.updateNote = null;
  }

  @action
  deleteNoteAction(note) {
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this note?', () => {
      this.ajax.request(`intake/${note.id}/delete-note`, {method: 'DELETE'})
        .then(() => {
          this.teamNotes.forEach((intakeYear) => {
            if (intakeYear.year === note.year) {
              set(intakeYear, 'notes', intakeYear.notes.filter((n) => n.id !== note.id));
            }
          });
          this.toast.success('The note was successfully deleted.');
        }).catch((response) => this.house.handleErrorResponse(response));
    });
  }
}
