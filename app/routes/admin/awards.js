import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminAwardsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query('award', {});
  }

  setupController(controller, model) {
    controller.awards = model;
    controller.entry = null;
  }
}
