import Controller from '@ember/controller';
import { action, set } from '@ember/object';

export default class ReportsPeopleByRoleController extends Controller {
  @action
  toggleRole(role) {
    set(role, 'showing', !role.showing);
  }
}
