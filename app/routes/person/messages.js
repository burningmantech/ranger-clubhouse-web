import Route from '@ember/routing/route';

export default class PersonMessagesRoute extends Route {
  model() {
    const person_id = this.modelFor('person').id;

    this.store.unloadAll('person-message');
    return this.store.query('person-message', { person_id })

  }
  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.person.set('unread_message_count', model.reduce((total, msg) => ((msg.delivered ? 0 : 1)+total), 0));
    controller.set('messages', model);
  }
}
