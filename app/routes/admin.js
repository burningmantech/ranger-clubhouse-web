import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_SLOTS, MEGAPHONE } from 'clubhouse/constants/roles';

export default class AdminRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_SLOTS, MEGAPHONE];
}
