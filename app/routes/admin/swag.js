import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminSwagsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query('swag', {});
  }

  setupController(controller, model) {
    controller.set('swags', model);
    controller.set('entry', null);
  }
}
