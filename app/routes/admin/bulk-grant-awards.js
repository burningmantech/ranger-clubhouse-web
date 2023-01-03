import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';


export default class AdminBulkGrantAwardsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query('award', {});
  }

  setupController(controller, model) {
    controller.set('awards', model);
    controller.set('haveResults', false);
    controller.set('haveServiceYearsResults', false);
    controller.set('commit', false);
    controller.set('serviceYears', 5);
    controller.set('awardId', controller.awards[0]?.id);
    controller.set('results', '');
  }
}
