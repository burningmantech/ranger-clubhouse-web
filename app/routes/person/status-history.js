import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';

export default class PersonStatusHistoryRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  model() {
    const personId = this.modelFor('person').id;

    return this.ajax.request(`person/${personId}/status-history`);
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('history', model.history);
  }
}
