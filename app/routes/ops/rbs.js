import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MEGAPHONE, MEGAPHONE_TEAM_ONPLAYA, MEGAPHONE_EMERGENCY_ONPLAYA} from 'clubhouse/constants/roles';

export default class OpsRbsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MEGAPHONE, MEGAPHONE_TEAM_ONPLAYA, MEGAPHONE_EMERGENCY_ONPLAYA];

  model() {
    // Pull in the configuration so users know what to expect.
    return this.ajax.request('rbs/config');
  }

  setupController(controller, model) {
    controller.set('config', model.config);
  }
}
