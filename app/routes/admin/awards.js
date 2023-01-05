import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminAwardsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query('award', {});
  }

  setupController(controller, model) {
    controller.set('awards', model);
    controller.set('entry', null);
  }
}
