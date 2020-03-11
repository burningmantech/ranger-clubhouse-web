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
    controller.sfConfig = model.config;
    controller.importStatus = '';
    controller.importMessage = '';
    controller.accounts = [];
    controller.isSubmitting = false;

    controller.resetFlags();
  }
}
