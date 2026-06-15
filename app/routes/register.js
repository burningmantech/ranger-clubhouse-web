import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class RegisterRoute extends ClubhouseRoute {
  beforeModel() {
    this.session.prohibitAuthentication('me.homepage');
  }

  // Controllers are singletons, so reset the wizard on every visit to avoid
  // showing a stale step or a half-filled form to a returning visitor.
  setupController(controller) {
    super.setupController(...arguments);
    controller.resetWizard();
  }
}
