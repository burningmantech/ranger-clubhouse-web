import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminSalesforceRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

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
