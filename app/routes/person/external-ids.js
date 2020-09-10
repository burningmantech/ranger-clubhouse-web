import Route from '@ember/routing/route';
import {Role} from 'clubhouse/constants/roles';

export default class PersonExternalIdsRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.ADMIN);

  }
  setupController(controller) {
    controller.set('person', this.modelFor('person'));
  }
}
