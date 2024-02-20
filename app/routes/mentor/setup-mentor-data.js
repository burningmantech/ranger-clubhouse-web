import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, MENTOR} from "clubhouse/constants/roles";

export default class MentorSetupMentorDataRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MENTOR]
}
