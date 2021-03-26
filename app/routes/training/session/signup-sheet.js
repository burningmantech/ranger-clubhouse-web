import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSessionSignupSheetRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.set('training', this.modelFor('training'));
    controller.setProperties(this.modelFor('training/session'));
  }
}
