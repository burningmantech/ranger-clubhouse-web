import Route from '@ember/routing/route';

export default class HqMessagesRoute extends Route {
  model() {
    const person_id = this.modelFor('hq').person.id;

    return this.store.query('person-message', { person_id })

  }
  setupController(controller, model) {
    controller.setProperties(this.modelFor('hq'));
    controller.set('messages', model);
  }
}
