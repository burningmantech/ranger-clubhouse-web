import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action, set} from '@ember/object';
import groupBy from 'clubhouse/utils/group-by';

export default class AdminSalesforceController extends ClubhouseController {
  @tracked commit = false;
  @tracked updateSalesforce = false;
  @tracked nonTestAccounts = false;
  @tracked showAll = false;
  @tracked resetTestAccounts = false;
  @tracked showConfirmModal = false;
  @tracked createAccounts = false;

  @tracked accounts = [];
  @tracked importMessage;
  @tracked importStatus;
  @tracked sfConfig;
  @tracked isSubmitting = false;
  @tracked showHelp = false;
  @tracked noAccountsFound = false;

  statusLabels = {
    'ready': {label: 'Ready for import', icon: 'thumbs-up'},
    'succeeded': {label: 'Successfully imported into Clubhouse', icon: 'check', color: 'success'},
    'existing': {label: 'Will convert to Prospective and update from Salesforce', icon: 'thumbs-up'},
    'invalid': {label: 'Invalid record status, Will not import', icon: 'ban', color: 'danger'},
    'imported': {label: 'Mark by Salesforce as already imported into Clubhouse, Will Not Import', icon: 'ban', color: 'danger'},
    'notready': {label: 'Not ready for import', icon: 'ban', color: 'danger'},
    'existing-callsign': {label: 'Callsign already exists, Will Not Import', icon: 'ban', color: 'danger'},
    'existing-bad-status': {
      label: 'Existing account cannot update due to non-Auditor or non-Past Prospective status',
      icon: 'times',
      color: 'danger'
    },
    'reset': {label: 'Reset Testing* Records Status', icon: 'check', color: 'success'},
  };

  get accountGroups() {
    const groups = groupBy(this.accounts, 'status');

    this._orderStatus(groups, 'imported');
    this._orderStatus(groups, 'existing-bad-status');
    this._orderStatus(groups, 'existing');
    this._orderStatus(groups, 'ready');
    this._orderStatus(groups, 'succeeded');

    groups.forEach((g) => {
      g.statusLabel = this.statusLabels[g.status] || {label: `Unknown status [${g.status}]`};
      g.items = g.items.sortBy('callsign');
    });

    return groups;
  }

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

  @action
  import() {
    // Normal both create accouht and update sf should be checked together
    if (this.createAccounts) {

      if (!this.updateSalesforce) {
        this.modal.confirm(null, 'You have checked "Create accounts" but "Update Salesforce flag" is unchecked. Normally, these two are checked together. Did you mean to do that?', () => {
          this.showConfirmModal = true;
        });
      } else {
        this.showConfirmModal = true;
      }
    } else {
      this._runImport();
    }
  }

  @action
  importConfirmed() {
    this.showConfirmModal = false;
    this._runImport();
  }

  @action
  cancelConfirmModal() {
    this.showConfirmModal = false;
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
        this.noAccountsFound = !this.accounts.length;
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
