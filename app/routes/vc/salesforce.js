import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, SALESFORCE_IMPORT} from 'clubhouse/constants/roles';

export default class VcSalesforceRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, SALESFORCE_IMPORT];

  model() {
    return this.ajax.request('salesforce/config');
  }

  setupController(controller, model) {
    controller.sfConfig = model.config;
    controller.importStatus = '';
    controller.importMessage = '';
    controller.accounts = [];
    controller.isSubmitting = false;
    controller.noAccountsFound = false;

    controller.resetFlags();
  }
}
