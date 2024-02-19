import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';
import EmberObject from '@ember/object';

export default class OpsBulkSignInOutRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, TIMESHEET_MANAGEMENT ];

  setupController(controller) {
    controller.set('bulkForm', EmberObject.create({ commit: false, lines: ''}));
    controller.set('committed', false);
    controller.set('haveError', false);
    controller.set('entries', []);
    controller.set('isSubmitting', false);
    controller.set('errorCount', 0);
  }
}
