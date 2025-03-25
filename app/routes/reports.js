import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EVENT_MANAGEMENT} from 'clubhouse/constants/roles';

// Namespace route - nothing really happening here other than to
// verify the user has the right role

export default class ReportsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EVENT_MANAGEMENT];

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
