import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonPasswordRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  setupController(controller, model) {
    controller.set('person', model);
    controller.set('passwordForm', {
      password: '',
      password_confirmation: ''
    });
  }
}
