import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminRolesRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model() {
    return this.store.findAll('role', { reload: true });
  }

  setupController(controller, model) {
    controller.set('entry', null);
    controller.set('roles', model);
  }
}
