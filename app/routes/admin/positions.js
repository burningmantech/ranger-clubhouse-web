import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminPositionRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN, this);
  }

  model() {
    return this.store.query('position', {}).then((result) => { return result.toArray() });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('positions', model);
    controller.set('position', null);
  }
}
