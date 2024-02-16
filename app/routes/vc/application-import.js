import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, SALESFORCE_IMPORT} from 'clubhouse/constants/roles';

export default class VcApplicationImportRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, SALESFORCE_IMPORT];
}
