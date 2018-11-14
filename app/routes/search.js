import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class SearchRoute extends Route {
  beforeModel(transition) {
      super.beforeModel(...arguments);
      if (!this.house.roleCheck([Role.ADMIN, Role.MANAGE])) {
        return;
      }

    if (transition.targetName == 'search.index') {
      this.transitionTo('search.person');
    }
  }
}
