import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonPersonalInfoRoute extends Route {
  beforeModel() {
    this.house.roleCheck([
       Role.ADMIN, [ Role.MANAGE, Role.VIEW_PII ]
    ]);
  }
  setupController(controller) {
    controller.set('person', this.modelFor('person'));
  }
}
