import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';

export default class AdminThankYouCardsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];

  queryParams = {
    year: {refreshModel: true}
  };

  model({year}) {
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
