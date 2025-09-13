import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {EDIT_EMERGENCY_CONTACT} from "clubhouse/constants/roles";

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    const {person} = model;
    controller.setProperties(model);
    controller.contactSaved = false;
    controller.isOnSite = person.on_site;
    controller.showSiteCheckInWizard = false;
    controller.siteCheckInStarted = false;
    controller.siteCheckInFinished = false;
    controller.canEditEmergencyContact =
      this.session.isAdmin
      || this.session.isEMOPEnabled
      || this.session.hasRole(EDIT_EMERGENCY_CONTACT);
  }
}
