import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Login from 'clubhouse/models/login';

export default class ResetPasswordRoute extends ClubhouseRoute {
  beforeModel() {
    this.session.prohibitAuthentication('me.homepage');
  }

  setupController(controller) {
    controller.set('auth', new Login);
  }
}
