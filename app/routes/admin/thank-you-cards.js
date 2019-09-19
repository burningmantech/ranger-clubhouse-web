import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminThankYouCardsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.TIMESHEET_MANAGEMENT]);
  }

  model({ year }) {
    return year; // route will only refresh if the model value changes
  }

  setupController(controller) {
    if (!controller.year) {
      controller.set('year', this.house.currentYear());
    }

    controller.set('people', null);
    controller.set('isSubmitting', false);
    controller.set('password', '');
    controller.set('passwordOkay', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
