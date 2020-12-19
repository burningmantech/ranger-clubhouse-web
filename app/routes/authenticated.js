import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// The top level authentication route - the user has to be logged in before being
// allowed to access any child route - i.e. just about everything.
export default class AuthenticatedRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel(transition) {
    super.beforeModel(...arguments);

    // Go to the home page if only hiting '/'
    if (transition.to.name === 'authenticated.index') {
      this.transitionTo('me.homepage');
    }
  }
}
