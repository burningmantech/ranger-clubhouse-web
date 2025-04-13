import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN,AWARD_MANAGEMENT} from "clubhouse/constants/roles";

export default class OpsBulkAwardsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, AWARD_MANAGEMENT];

  setupController(controller) {
    controller.callsignList = '';
    controller.records = [];
    controller.isSubmitting = false;
    controller.didCommit = false;
  }
}
