import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonStatusHistoryRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.VC ]);

  }
  model() {
    const personId = this.modelFor('person').id;

    return this.ajax.request(`person/${personId}/status-history`);
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('history', model.history);
  }
}
