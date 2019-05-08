import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminHelpRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);

    this.house.roleCheck(Role.ADMIN);
  }

  model() {
    this.store.unloadAll('help');

    return this.store.query(`help`, { }).then((result) => result.toArray());
  }

  setupController(controller, model) {
    controller.set('documents', model);
  }
}
