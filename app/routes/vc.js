import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class VcRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([ Role.ADMIN, Role.VC, Role.EDIT_BMIDS ]);
  }
}
