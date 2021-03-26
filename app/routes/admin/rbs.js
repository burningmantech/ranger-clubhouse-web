import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, MEGAPHONE, EDIT_SLOTS } from 'clubhouse/constants/roles';

export default class AdminRbsRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, MEGAPHONE, EDIT_SLOTS ];

  model() {
    // Pull in the configuration so users know what to expect.
    return this.ajax.request('rbs/config');
  }

  setupController(controller, model) {
    controller.set('config', model.config);
  }
}
