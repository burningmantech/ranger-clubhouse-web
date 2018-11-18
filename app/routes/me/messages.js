import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeMessagesRoute extends Route.extend(MeRouteMixin) {
  model() {
    return this.store.query('person-message', {person_id: this.session.user.id});
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('messages', model);
  }
}
