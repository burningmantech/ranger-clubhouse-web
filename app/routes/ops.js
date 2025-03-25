import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {EVENT_MANAGEMENT} from 'clubhouse/constants/roles';

export default class OpsRoute extends ClubhouseRoute {
  roleRequired = EVENT_MANAGEMENT;
}
