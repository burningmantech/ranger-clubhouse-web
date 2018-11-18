import Route from '@ember/routing/route';

export default class PersonMessagesRoute extends Route {
  setupController(controller) {
    controller.setProperties(this.modelFor('person'));
  }
}
