import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class PersonPasswordRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller, model) {
    controller.set('person', model);
    controller.set('passwordForm', {password: '', password_confirmation: ''});
  }
}
