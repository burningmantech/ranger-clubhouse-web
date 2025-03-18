import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN} from "clubhouse/constants/roles";
import {ECHELON} from "clubhouse/constants/person_status";
import {GENDER_NONE} from "clubhouse/models/person";

export default class AdminPersonCreateRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller) {
    controller.person = this.store.createRecord('person', {
      status: ECHELON,
      alt_phone: '',
      street2: '',
      apt: '',
      mi: '',
      country: 'US',
      camp_location: '',
      emergency_contact: '',
      gender_identity: GENDER_NONE,
    });
    controller.askForPassword = false;
  }
}
