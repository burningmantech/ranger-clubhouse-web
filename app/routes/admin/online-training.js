import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminOnlineTrainingRoute extends ClubhouseRoute {
  roleRequired = ADMIN;
}
