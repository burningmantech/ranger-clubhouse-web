import Route from '@ember/routing/route';

export default class PersonMessagesRoute extends Route {
  model() {
    const person_id = this.modelFor('person').person.id;

    return this.store.query('person-message', { person_id })

  }
  setupController(controller, model) {
    controller.setProperties(this.modelFor('person'));
    controller.set('messages', model);
  }
}
