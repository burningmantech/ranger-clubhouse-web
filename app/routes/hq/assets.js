import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqAssetsRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.setProperties(this.modelFor('hq'));
    controller.set('year', this.house.currentYear());
  }
}
