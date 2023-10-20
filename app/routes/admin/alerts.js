import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminAlertsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('alert');

    return this.store.query(`alert`, { });
  }

  setupController(controller, model) {
    controller.set('alerts', model);
  }
}
