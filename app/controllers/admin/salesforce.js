import Controller from '@ember/controller';
import { set } from '@ember/object';
import { action } from '@ember-decorators/object';

export default class AdminSalesforceController extends Controller {
  commit = false;
  updateSalesforce = false;
  nonTestAccounts = false;
  showAll = false;
  resetTestAccounts = false;

  @action
  import() {
    this.toast.clear();
    this.set('isSubmitting', true);
    const options = {};
    if (this.showAll) {
      options.showall = 1;
    }

    if (this.updateSalesforce) {
      options.update_sf = 1;
    }

    if (this.nonTestAccounts) {
      options.non_test_accounts = 1;
    }

    if (this.resetTestAccounts) {
      options.reset_test_accounts = 1;
    }

    if (this.createAccounts) {
      options.create_accounts = 1;
    }

    this.ajax.request('salesforce/import', { data: options }).then((result) => {
      this.set('importStatus', result.status);
      this.set('importMessage', result.message);
      this.set('accounts', result.accounts);
    })
    .catch((response) => this.house.handleErrorResponse(response))
    .finally(() => {
      this.set('isSubmitting', false);
      this.set('createAccounts', false);
      this.set('updateSalesforce', false);
      this.set('nonTestAccounts', false);
      this.set('showAll', false);
      this.set('resetTestAccounts', false);
    });
  }

  @action
  expandAll() {
    this.accounts.forEach((account) => set(account, 'showing', true) );
  }

  @action
  toggleAccount(account) {
    set(account, 'showing', !account.showing);
  }

  @action
  toggleHelp() {
    this.set('showHelp', !this.showHelp);
  }
}
