import Route from '@ember/routing/route';

export default class PersonMessagesRoute extends Route {
  model() {
    const person_id = this.modelFor('person').id;

    return this.store.query('person-message', { person_id })

  }
  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('messages', model);
  }
}
