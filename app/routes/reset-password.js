import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import EmberObject from '@ember/object';

export default class ResetPasswordRoute extends ClubhouseRoute {
  beforeModel() {
    this.session.prohibitAuthentication('me.homepage');
  }

  setupController(controller) {
    controller.set('auth', EmberObject.create({
      identification: '',
      password: ''
    }));
  }
}
