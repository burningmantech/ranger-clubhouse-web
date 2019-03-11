import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminSalesforceRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN ]);
  }

  model() {
    return this.ajax.request('salesforce/config');
  }

  setupController(controller, model) {
    controller.set('sfConfig', model.config);
    controller.set('importStatus', '');
    controller.set('importMessage', '');
    controller.set('accounts', []);
  }
}
