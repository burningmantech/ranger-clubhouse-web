import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminRoute extends ClubhouseRoute {
  roleRequired = ADMIN
}
