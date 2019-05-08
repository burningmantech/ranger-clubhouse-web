import Route from '@ember/routing/route';

export default class HqAssetsRoute extends Route {
  setupController(controller) {
    controller.setProperties(this.modelFor('hq'));
    controller.set('year', this.house.currentYear());
  }
}
