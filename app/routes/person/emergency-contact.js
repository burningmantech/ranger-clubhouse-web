import Route from '@ember/routing/route';
import {Role} from 'clubhouse/constants/roles';

export default class PersonEmergencyContactRoute extends Route {
  beforeModel() {
    this.house.roleCheck([Role.ADMIN, Role.MANAGE]);
  }

  setupController(controller) {
    const person = this.modelFor('person');
    controller.set('person', person);
    /*
     Person allowed to view EC info if
     - the user is the person OR
     - the person is an Admin
     - the person has LM and LoginManageOnPlayaEnabled is on.
     */
    controller.set('canAccessEmergencyContact',
      (person.id == this.session.userId)
      || this.session.user.isAdmin
      || this.session.isLMOPEnabled);
  }
}
