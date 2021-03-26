import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminRolesRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.findAll('role', { reload: true });
  }

  setupController(controller, model) {
    controller.set('entry', null);
    controller.set('roles', model);
  }
}
