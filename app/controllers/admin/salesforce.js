import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import {action, set} from '@ember/object';
import groupBy from 'clubhouse/utils/group-by';

export default class AdminSalesforceController extends Controller {
  @tracked commit = false;
  @tracked updateSalesforce = false;
  @tracked nonTestAccounts = false;
  @tracked showAll = false;
  @tracked resetTestAccounts = false;

  @tracked accounts = [];
  @tracked importMessage;
  @tracked importStatus;
  @tracked sfConfig;
  @tracked isSubmitting = false;
  @tracked showHelp = false;

  statusLabels = {
    'succeeded': 'Successfully imported into Clubhouse',
    'existing': 'Will convert to Prospective and update from Salesforce',
    'invalid': 'Invalid record status',
    'imported': 'Mark by Salesforce as already imported into Clubhouse',
    'ready': 'Ready for import',
    'notready': 'Not ready for import',
    'existing-callsign': 'Callsign already exists',
    'existing-bad-status': 'Existing account cannot update due to non-Auditor or non-Past Prospective status',
    'reset': 'Reset Salesforce status',
  };

  resetFlags() {
    this.createAccounts = false;
    this.updateSalesforce = false;
    this.nonTestAccounts = false;
    this.showAll = false;
    this.resetTestAccounts = false;
  }

  _orderStatus(groups, status) {
    const group = groups.find((g) => g.status == status);
    if (group) {
      groups.removeObject(group);
      groups.unshift(group);
    }
  }

  get accountGroups() {
    const groups = groupBy(this.accounts, 'status');

    this._orderStatus(groups, 'imported');
    this._orderStatus(groups, 'existing-bad-status');
    this._orderStatus(groups, 'existing');
    this._orderStatus(groups, 'ready');
    this._orderStatus(groups, 'succeeded');

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

    this.isSubmitting = true;

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

    this.ajax.request('salesforce/import', {data: options})
      .then((result) => {
        this.importStatus = result.status;
        this.importMessage = result.message;
        this.accounts = result.accounts;
        this.resetFlags();
      })
      .catch((response) => {
        this.house.handleErrorResponse(response);
        this.accounts = [];
      })
      .finally(() => {
        this.isSubmitting = false;
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
    this.showHelp = !this.showHelp;
  }
}
