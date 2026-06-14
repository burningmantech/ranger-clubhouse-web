import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {ADMIN, INTAKE, MENTOR, REGIONAL_MANAGEMENT, VC} from 'clubhouse/constants/roles';
import {service} from '@ember/service';

export default class IntakeNotesComponent extends Component {
  @tracked addingNotes;
  @tracked updateNote;

  @service ajax;
  @service errors;
  @service modal;
  @service session;
  @service toast;


  get teamNotes() {
    // Might be updated at any time.
    return this.args.person[this.args.type + '_team'];
  }

  // Callers may request a full-size action button (e.g. the potentials Dense
  // Triage rows, which must avoid small text). Defaults to the compact button.
  get noteButtonSize() {
    return this.args.buttonSize ?? 'sm';
  }

  get sortedTeamNotes() {
    const notes = this.teamNotes;
    if (!notes) {
      return notes;
    }
    return notes.slice().sort((a, b) => b.year - a.year);
  }

  // Whether to render the action button at all. Pages that show a team's notes
  // purely for reference (e.g. /mentor/convert-prospectives, where only the
  // Mentor stream is editable) pass @readOnly to suppress both "Add Note / Rank"
  // and "View Details" while the notes above still render inline.
  get showNoteButton() {
    if (this.args.readOnly) {
      return false;
    }
    return this.canAddNote || this.teamNotes;
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
        role = ADMIN; // yah, it's a double check below.
        break;
      case 'rrn':
        role = REGIONAL_MANAGEMENT;
        break;
      default:
        role = INTAKE;
        break;
    }

    return this.session.hasRole([ADMIN, role]);
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
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this note?', async () => {
      try {
        await this.ajax.request(`intake/${note.id}/delete-note`, {method: 'DELETE'});
        this.teamNotes.forEach((intakeYear) => {
          if (intakeYear.year === note.year) {
            set(intakeYear, 'notes', intakeYear.notes.filter((n) => n.id !== note.id));
          }
        });
        this.toast.success('The note was successfully deleted.');
      } catch (response) {
        this.errors.handleErrorResponse(response);
      }
    });
  }
}
