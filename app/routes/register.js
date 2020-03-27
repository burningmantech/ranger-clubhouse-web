import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class RegisterRoute extends Route.extend(UnauthenticatedRouteMixin) {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('isSaving', false);
    controller.set('step', 'ask-intent');
    controller.set('registerForm', {});
  }
}
