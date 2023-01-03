import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminCertificationRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('certification');
    return this.store.query(`certification`, {});
  }

  setupController(controller, model) {
    controller.set('certifications', model);
  }
}
