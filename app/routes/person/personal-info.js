import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE, VIEW_PII} from 'clubhouse/constants/roles';
import shirtOptions from 'clubhouse/utils/shirt-options';

export default class PersonPersonalInfoRoute extends ClubhouseRoute {
  // User has to be an Admin or have Login Manage AND View Personal Info
  roleRequired = [ADMIN, [MANAGE, VIEW_PII]];

  model() {
    return this.ajax.request('swag/shirts');
  }

  setupController(controller, {shirts}) {
    controller.person = this.modelFor('person');
    controller.setProperties(shirtOptions(shirts));
  }
}
