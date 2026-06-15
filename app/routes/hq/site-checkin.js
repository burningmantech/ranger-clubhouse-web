import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {EDIT_EMERGENCY_CONTACT} from "clubhouse/constants/roles";

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    super.setupController(controller, model);

    const {person, personEvent, eventInfo, assets, attachments, eventPeriods} = model;
    // Explicit allow-list: the leaf has no model() hook, so only fan the keys it
    // actually consumes onto the controller (avoids hidden, untracked props).
    controller.setProperties({person, personEvent, eventInfo, assets, attachments, eventPeriods});

    // Single owner for per-entry reset of all wizard/submit state.
    controller.resetState(model.person);

    // PII gate is UX-only; ranger-clubhouse-api enforces the actual write
    // authorization on emergency_contact/camp_location.
    controller.canEditEmergencyContact =
      this.session.isAdmin
      || this.session.isEMOPEnabled
      || this.session.hasRole(EDIT_EMERGENCY_CONTACT);
  }
}
