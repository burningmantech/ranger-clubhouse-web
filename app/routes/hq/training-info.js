import Route from '@ember/routing/route';

export default class HqTrainingInfoRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('hq'));
  }
}
