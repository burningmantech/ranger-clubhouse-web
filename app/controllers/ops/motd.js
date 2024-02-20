import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class OpsMotdController extends ClubhouseController {
  @tracked entry;
  @tracked query;

  queryParams = ['audience', 'type', 'sort', 'page', 'page_size'];

  typeOptions = [
    ['All', 'all'],
    ['Expired', 'expired'],
    ['Active', 'active'],
  ];

  sortOptions = [
    ['Descending', 'desc'],
    ['Ascending', 'asc']
  ];

  audienceOptions = [
    'all',
    'rangers',
    ['prospectives/alphas', 'pnvs'],
    'auditors'
  ];

  motdValidations = {
    expires_at: [validatePresence(true)],
    subject: [validatePresence(true)],
    message: [validatePresence(true)],
  };


  @action
  newEntry() {
    this.entry = this.store.createRecord('motd');
  }

  @action
  cancelEntry() {
    this.entry = null;
  }

  @action
  editEntry(motd) {
    this.entry = motd;
  }

  @action
  saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }
    const isNew = this.entry.isNew;

    if (!model.for_pnvs && !model.for_auditors && !model.for_rangers) {
      this.modal.info(null, 'Check one or more audiences to show the message to.');
      return;
    }

    model.save().then(() => {
      this.toast.success(`MOTD was successfully ${isNew ? 'created' : 'updated'}.`);
      this.motds.update();
      this.entry = null;
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteEntry() {
    this.modal.confirm('Delete MOTD entry', 'Are you sure?', () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('MOTD has been removed.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  resetFilters() {
    this.query = {sort: 'desc', audience: 'pnvs', type: 'all'};
  }

  @action
  searchAction() {
    this.queryParams.forEach((param) => {
      set(this, param, this.query[param] ?? null);
    });
  }

  @action
  goNextPage() {
    set(this, 'page', +this.currentPage + 1);
  }

  @action
  goPrevPage() {
    set(this, 'page', +this.currentPage - 1);
  }
}
