import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminMaintenanceRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.ajax.request('ticketing/info');
  }

  setupController(controller, model) {
    controller.set('ticketingInfo', model.ticketing_info);
    controller.task =  null;
    controller.taskParam = null;
    controller.isSubmitting = false;
    controller.taskAction = null;
  }
}
