import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminAlertsRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model() {
    this.store.unloadAll('alert');

    return this.store.query(`alert`, { }).then((result) => result.toArray());
  }

  setupController(controller, model) {
    controller.set('alerts', model);
  }
}
