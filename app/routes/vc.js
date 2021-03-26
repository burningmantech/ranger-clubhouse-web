import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_BMIDS, VC } from 'clubhouse/constants/roles';

export default class VcRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS, VC];
}
