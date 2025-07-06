import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE} from 'clubhouse/constants/roles';

export default class PersonEmergencyContactRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  setupController(controller) {
    const person = this.modelFor('person');
    controller.set('person', person);
    /*
     Person allowed to view EC info if
     - the user is the person OR
     - the person is an Admin
     - the person has LM and EventManagementOnPlayaEnabled is on.
     */
    controller.set('canAccessEmergencyContact',
      (+person.id === this.session.userId) || this.session.isAdmin || this.session.isEMOPEnabled);
  }
}
