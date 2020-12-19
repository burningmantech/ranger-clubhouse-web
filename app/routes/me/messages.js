import Route from '@ember/routing/route';

export default class MeMessagesRoute extends Route {
  model() {
    this.store.unloadAll('person-message');

    return this.store.query('person-message', {person_id: this.session.userId});
  }

  setupController(controller, model) {
    const user = this.session.user;
    user.set('unread_message_count', model.reduce((total, msg) => ((msg.delivered ? 0 : 1)+total), 0));
    controller.set('messages', model);
  }
}
