import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class AdminHelpController extends ClubhouseController {
  @tracked entry;
  @tracked createSlug;
  @tracked documents;
  @tracked viewDocuments;

  queryParams = [ 'createSlug', 'editSlug' ];

  @action
  newHelp() {
    this.entry = this.store.createRecord('help');
  }

  @action
  editHelp(help) {
    this.entry = help;
  }

  @action
  cancelHelp() {
    this.entry = null;
  }

  @action
  async saveHelp(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.isNew;

    if (await this.saveModel.save({model, message: `Help document was successfully ${isNew ? 'created' : 'updated'}.`})) {
      this.entry = null;
      this.documents.update().then(() => this._sortDocuments());
    } else {
      this.entry?.rollbackAttributes();
    }
  }

  @action
  deleteHelp() {
    this.modal.confirm(`Confirm help document deletion`, `Are you sure you want to delete "${this.entry.slug}?"`,
      async () => {
        try {
          await this.entry.destroyRecord();
          this.entry = null;
          this.toast.success(`Help document was successfully deleted.`);
        } catch (response) {
          this.errors.handleErrorResponse(response);
        }
      });
  }

  _sortDocuments() {
    this.viewDocuments = _.sortBy(this.documents,'slug');
  }
}
