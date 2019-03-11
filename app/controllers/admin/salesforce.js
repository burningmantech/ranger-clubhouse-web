import Controller from '@ember/controller';
import { set } from '@ember/object';
import { action } from '@ember-decorators/object';

export default class AdminSalesforceController extends Controller {
  @action
  import() {
    this.toast.clear();
    this.set('isSubmitting', true);
    this.ajax.request('salesforce/import').then((result) => {
      this.set('importStatus', result.status);
      this.set('importMessage', result.message);
      this.set('accounts', result.accounts);
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false) );
  }

  @action
  expandAll() {
    this.accounts.forEach((account) => set(account, 'showing', true) );
  }

  @action
  toggleAccount(account) {
    set(account, 'showing', !account.showing);
  }
}
