import Controller from '@ember/controller';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';
import groupBy from 'clubhouse/utils/group-by';

export default class AdminSalesforceController extends Controller {
  commit = false;
  updateSalesforce = false;
  nonTestAccounts = false;
  showAll = false;
  resetTestAccounts = false;

  statusLabels = {
    'succeeded': 'Successfully imported into Clubhouse',
    'invalid': 'Invalid record status',
    'imported': 'Mark by Salesforce as already imported into Clubhouse',
    'ready': 'Ready for import',
    'notready': 'Not ready for import',
    'already_exists_bpguid': 'BPGUID Already Exists',
    'already_exists_email': 'Email Already Exists',
    'already_exists_callsign': 'Callsign Already Exists',
    'reset': 'Reset Salesforce status',
  };

  resetFlags() {
    this.set('createAccounts', false);
    this.set('updateSalesforce', false);
    this.set('nonTestAccounts', false);
    this.set('showAll', false);
    this.set('resetTestAccounts', false);
  }

  @computed('accounts')
  get accountGroups() {
    const groups = groupBy(this.accounts, 'status');

    const ready = groups.find((g) => g.status == 'ready');
    const imported = groups.find((g) => g.status == 'imported');
    const succeeded = groups.find((g) => g.status == 'succeeded');

    // Order the groups by ready, imported, and succeeded
    if (succeeded) {
      groups.removeObject(succeeded);
      groups.unshift(succeeded);
    }
    if (imported) {
      groups.removeObject(imported);
      groups.unshift(imported);
    }
    if (ready) {
      groups.removeObject(ready);
      groups.unshift(ready);
    }

    groups.forEach((g) => {
      g.statusLabel = this.statusLabels[g.status] || `Unknown status [${g.status}]`;
      g.items = g.items.sortBy('callsign');
    });

    return groups;
  }

  @action
  import() {
    this.toast.clear();

    // Normal both create accouht and update sf should be checked together
    if (this.createAccounts && !this.updateSalesforce) {
      this.modal.confirm(null, 'You have checked "Create accounts" but "Update Salesforce flag" is unchecked. Normally, these two are checked togehter. Did you mean to do that?', () => {
        this._runImport();
      });
    } else {
      this._runImport();
    }
  }

  _runImport() {
    const options = {};
    this.set('isSubmitting', true);

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

    this.ajax.request('salesforce/import', { data: options })
       .then((result) => {
        this.set('importStatus', result.status);
        this.set('importMessage', result.message);
        this.set('accounts', result.accounts);
        this.resetFlags();
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => {
        this.set('isSubmitting', false);
      });
  }

  @action
  toggleAll(group) {
    set(group, 'expandedAll', !group.expandedAll);
    const show = group.expandedAll;
    group.items.forEach((account) => set(account, 'showing', show));
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
