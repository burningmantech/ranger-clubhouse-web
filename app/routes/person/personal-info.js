import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE, VIEW_PII} from 'clubhouse/constants/roles';

export default class PersonPersonalInfoRoute extends ClubhouseRoute {
  // User has to be an Admin or have Login Manage AND View Personal Info
  roleRequired = [ADMIN, [MANAGE, VIEW_PII]];

  setupController(controller) {
    controller.set('person', this.modelFor('person'));
  }
}
