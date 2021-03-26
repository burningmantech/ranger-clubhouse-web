import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class RegisterRoute extends ClubhouseRoute {
  beforeModel() {
    this.session.prohibitAuthentication('me.homepage');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('isSaving', false);
    controller.set('step', 'ask-intent');
    controller.set('registerForm', {});
  }
}
