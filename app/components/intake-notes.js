import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {Role} from 'clubhouse/constants/roles';
import {inject as service} from '@ember/service';

export default class IntakeNotesComponent extends Component {
  @tracked addingNotes = false;
  @service session;

  get teamNotes() {
    return this.args.person[this.args.type + '_team'];
  }

  // Is the user allowed to add a team note?
  get canAddNote() {
    let role;

    switch (this.args.type) {
      case 'mentor':
        role = Role.MENTOR;
        break;
      case 'vc':
        role = Role.VC;
        break;
      case 'personnel':
        role = Role.ADMIN;
        break;
      default:
        role = Role.INTAKE;
        break;
    }

    return this.session.user.hasRole(role);
  }

  @action
  addNoteAction() {
    this.addingNotes = true;
  }

  @action
  closeNoteAction() {
    this.addingNotes = false;
  }
}
