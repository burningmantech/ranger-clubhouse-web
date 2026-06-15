import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, TRAINER_RESOURCE_MANAGEMENT_BASE} from "clubhouse/constants/roles";

export default class TrainingResourcesRoute extends ClubhouseRoute {
  setupController(controller) {
    const training = this.modelFor('training');

    controller.training = training;

    controller.canEditTrainerResource = this.session.hasRole([ TRAINER_RESOURCE_MANAGEMENT_BASE | training.id, ADMIN]);
  }

  resetController(controller) {
    controller.editDocument = null;
  }
}
