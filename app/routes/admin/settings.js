import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminSettingsRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.ADMIN);
  }

  model() {
    return this.store.findAll('setting');
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('settings', model);
    controller.set('filterByName', '');
  }
}
