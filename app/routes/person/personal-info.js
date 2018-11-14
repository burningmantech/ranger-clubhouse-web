import Route from '@ember/routing/route';

export default class PersonPersonalInfoRoute extends Route {
  setupController(controller) {
    controller.setProperties(this.modelFor('person'));
  }
}
