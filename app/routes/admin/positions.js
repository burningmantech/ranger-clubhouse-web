import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminPositionRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('position');
    return this.store.query('position', {});
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('positions', model);
    controller.set('position', null);
  }
}
