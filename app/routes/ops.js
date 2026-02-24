import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {MANAGE, VEHICLE_INFO_UPDATE} from 'clubhouse/constants/roles';

export default class OpsRoute extends ClubhouseRoute {
  roleRequired = [MANAGE, VEHICLE_INFO_UPDATE];
}
