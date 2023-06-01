import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {MANAGE} from 'clubhouse/constants/roles';
import shirtGroupsSort from 'clubhouse/utils/shirt-groups-sort';

export default class ReportsAlphaShirtsRoute extends ClubhouseRoute {
  roleRequired = [MANAGE];

  model() {
    return this.ajax.request(`person/alpha-shirts`).then((result) => result.alphas);
  }

  setupController(controller, model) {
    controller.set('year', this.house.currentYear());
    controller.set('alphas', model);
    controller.set('shirtGroups', shirtGroupsSort(model));
  }
}
