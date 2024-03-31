import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {MANAGE} from 'clubhouse/constants/roles';

export default class OpsRoute extends ClubhouseRoute {
  roleRequired = MANAGE;
}
