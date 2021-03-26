import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSessionTrainersReportRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.set('training', this.modelFor('training'));
    controller.setProperties(this.modelFor('training/session'));
    controller.computeStudentCounts();
  }
}
