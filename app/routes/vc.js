import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ACCESS_DOCS, EDIT_BMIDS, VC} from 'clubhouse/constants/roles';

export default class VcRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS, EDIT_ACCESS_DOCS, VC];
}
