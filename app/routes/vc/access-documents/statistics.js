import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ACCESS_DOCS} from 'clubhouse/constants/roles';

export default class VcAccessDocumentsStatisticsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  model() {
    return this.ajax.request('ticketing/statistics');
  }

  setupController(controller,model) {
    controller.set('statistics', model.statistics);
  }
}
