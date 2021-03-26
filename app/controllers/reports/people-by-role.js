import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';

export default class ReportsPeopleByRoleController extends ClubhouseController {
  @action
  toggleRole(role) {
    set(role, 'showing', !role.showing);
  }
}
