import Route from '@ember/routing/route';

// The top level authentication route - the user has to be logged in before being
// allowed to access any child route - i.e. just about everything.
export default class AuthenticatedRoute extends Route {
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    // Go to the home page if only hiting '/'
    if (transition.to.name === 'authenticated.index') {
      this.transitionTo('me.homepage');
    }
  }
}
