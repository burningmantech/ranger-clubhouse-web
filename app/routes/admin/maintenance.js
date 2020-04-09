import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminMaintenanceRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.ADMIN);
  }

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
