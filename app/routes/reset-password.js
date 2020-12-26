import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Login from 'clubhouse/models/login';

export default class ResetPasswordRoute extends Route.extend(UnauthenticatedRouteMixin) {
  routeIfAlreadyAuthenticated = 'me.homepage';

  setupController(controller) {
    controller.set('auth', new Login);
  }
}
