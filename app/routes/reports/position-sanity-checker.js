import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class ReportsPositionSanityCheckerRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([ Role.ADMIN, Role.GRANT_POSITION, Role.MANAGE ]);
  }

  model() {
    return this.ajax.request('position/sanity-checker');
  }

  setupController(controller, model) {
    this._setChecked(model.green_dot);
    controller.set('green_dot', model.green_dot);

    this._setChecked(model.management_role);
    controller.set('management_role', model.management_role);

    this._setChecked(model.shiny_pennies);
    controller.set('shiny_pennies', model.shiny_pennies);

    controller.set('shiny_penny_year', model.shiny_penny_year);
  }

  _setChecked(rows) {
    rows.forEach((row) => row.checked = 1);
  }
}
