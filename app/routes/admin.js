import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.EDIT_SLOTS, Role.ADMIN, Role.MEGAPHONE]);
  }
}
