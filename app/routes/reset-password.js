import Route from '@ember/routing/route';
import Login from 'clubhouse/models/login';

export default class ResetPasswordRoute extends Route {
  beforeModel() {
    this.session.prohibitAuthentication('me.homepage');
  }

  setupController(controller) {
    controller.set('auth', new Login);
  }
}
