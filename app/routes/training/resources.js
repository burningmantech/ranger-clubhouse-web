import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class TrainingResourcesRoute extends ClubhouseRoute {
  setupController(controller) {
    const training = this.modelFor('training');

    controller.set('training', training);
  }
}
