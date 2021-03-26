import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';
import EmberObject from '@ember/object';

export default class AdminBulkSignInOutRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller) {
    controller.set('bulkForm', EmberObject.create({ commit: false, lines: ''}));
    controller.set('committed', false);
    controller.set('haveError', false);
    controller.set('entries', []);
    controller.set('isSubmitting', false);
    controller.set('errorCount', 0);
  }
}
