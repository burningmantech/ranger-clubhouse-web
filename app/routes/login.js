import Route from '@ember/routing/route';
import Login from 'clubhouse/models/login';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {
  routeIfAlreadyAuthenticated = 'me.homepage';

  setupController(controller) {
    controller.set('authForm', new Login);
    this.house.clearStorage();
  }
}
