import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqTrainingInfoRoute extends ClubhouseRoute {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('hq'));
  }
}
