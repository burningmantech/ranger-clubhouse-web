import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import EmberObject from '@ember/object';

export default class AdminBulkSignInOutRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.ADMIN);
  }

  setupController(controller) {
    controller.set('bulkForm', EmberObject.create({ commit: false, lines: ''}));
    controller.set('committed', false);
    controller.set('haveError', false);
    controller.set('entries', []);
  }
}
