import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

/*
   Welcome page for PNVs. Force the user to set a password, and give additional instructions.
 */

export default class MeWelcomeRoute extends ClubhouseRoute {
  beforeModel() {
    if (!this.session.isWelcome) {
      this.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  setupController(controller) {
    controller.set('password', {password: '', password_confirmation: ''});
  }
}
