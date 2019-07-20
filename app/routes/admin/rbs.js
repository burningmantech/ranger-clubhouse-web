import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminRbsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.MEGAPHONE, Role.EDIT_SLOTS ]);
  }

  model() {
    // Pull in the configuration so users know what to expect.
    return this.ajax.request('rbs/config');
  }

  setupController(controller, model) {
    controller.set('config', model.config);
  }
}
