import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminDocumentsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.MEGAPHONE ]);
  }

  model() {
    this.store.unloadAll('document');
    return this.store.query('document', {});
  }

  setupController(controller, model) {
    controller.set('documents', model);
  }
}
