import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, EDIT_ACCESS_DOCS} from "clubhouse/constants/roles";

export default class VcAccessDocumentsMaintenanceRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

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
