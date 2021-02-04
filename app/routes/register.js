import Route from '@ember/routing/route';

export default class RegisterRoute extends Route {
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
