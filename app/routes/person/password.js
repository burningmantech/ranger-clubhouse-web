import Route from '@ember/routing/route';

export default class PersonPasswordRoute extends Route {
  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('person', model.person);
  }
}
