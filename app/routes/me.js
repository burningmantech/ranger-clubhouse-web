import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class MeRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return this.store.find('person', this.session.userId);
  }

  setupController(controller, model) {
    controller.set('user', this.session.user);
    controller.set('person', model);
  }
}
