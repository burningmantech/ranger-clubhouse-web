import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class PersonExternalIdsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller) {
    controller.set('person', this.modelFor('person'));
  }
}
