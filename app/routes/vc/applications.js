import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, VC} from "clubhouse/constants/roles";

export default class VcApplicationsRoute extends ClubhouseRoute {
   roleRequired = [ ADMIN, VC ];

 }
