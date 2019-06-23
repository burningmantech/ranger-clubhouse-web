import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeMessagesRoute extends Route.extend(MeRouteMixin) {
  model() {
    this.store.unloadAll('person-message');

    return this.store.query('person-message', {person_id: this.session.userId});
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('messages', model);
    controller.user.set('unread_message_count', model.reduce((total, msg) => ((msg.delivered ? 0 : 1)+total), 0));
    controller.person.set('unread_message_count', this.session.user.unread_message_count);
  }
}
