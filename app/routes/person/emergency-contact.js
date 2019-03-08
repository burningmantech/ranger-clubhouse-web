import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonEmergencyContactRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.MANAGE]);
  }

  setupController(controller) {
    controller.set('person', this.modelFor('person'));
  }
}
