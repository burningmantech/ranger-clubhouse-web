import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminMaintenanceRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller, model) {
    controller.task =  null;
    controller.taskParam = null;
    controller.isSubmitting = false;
    controller.taskAction = null;
  }
}
