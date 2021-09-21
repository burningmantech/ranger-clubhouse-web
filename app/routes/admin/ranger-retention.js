import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminRangerRetentionRoute extends ClubhouseRoute {
  hasRole = ADMIN;

  model() {
    return this.ajax.request('timesheet/retention-report');
  }

  setupController(controller, model){
    controller.setProperties(model);
  }
}
