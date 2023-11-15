import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, VC} from "clubhouse/constants/roles";

export default class VcMaintenanceRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];
}
