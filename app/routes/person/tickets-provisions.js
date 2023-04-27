import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ACCESS_DOCS} from 'clubhouse/constants/roles';

export default class PersonTicketsProvisionsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  setupController(controller) {
    controller.set('person', this.modelFor('person'));
    controller.set('year', this.house.currentYear());
    controller.loadStuff();
  }
}
