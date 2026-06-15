import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminRangerRetentionRoute extends ClubhouseRoute {
  hasRole = ADMIN;

  setupController(controller) {
    const year = this.session.currentYear();
    controller.set('topEarners', []);
    controller.set('haveResults', false);
    controller.set('isSubmitting', false);
    controller.set('topForm', {
      startYear: year,
      endYear: year,
      limit: 200
    });
  }
}
