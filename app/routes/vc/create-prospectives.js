import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, SALESFORCE_IMPORT} from "clubhouse/constants/roles";

export default class VcCreateProspectivesRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, SALESFORCE_IMPORT];

  model() {
    return this.ajax.request('salesforce/config');
  }

  setupController(controller, model) {
    controller.sfConfig = model.config;
    controller.applicationGroups = [];
    controller.haveResults = false;
    controller.isSubmitting = false;
  }
}
