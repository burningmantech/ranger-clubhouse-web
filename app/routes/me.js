import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeRoute extends Route.extend(AuthenticatedRouteMixin, MeRouteMixin) {
  model() {
    return this.session.user;
  }
}
