import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ACCESS_DOCS} from 'clubhouse/constants/roles';

export default class VcAccessDocumentsUnclaimedWithSignupsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  model() {
    return this.ajax.request('access-document/unclaimed-tickets-with-signups');
  }

  setupController(controller, model) {
    controller.set('tickets', model.tickets);
  }
}
