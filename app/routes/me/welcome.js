import Route from '@ember/routing/route';

/*
   Welcome page for PNVs. Force the user to set a password, and give additional instructions.
 */

export default class MeWelcomeRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);

    if (!this.session.isWelcome) {
      this.transitionTo('me.homepage');
    }
  }

  setupController(controller) {
    controller.set('password', {password: '', password_confirmation: ''});
  }
}
