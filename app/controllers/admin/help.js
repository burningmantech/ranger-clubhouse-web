import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AdminHelpController extends Controller {
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
  saveHelp(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.isNew;

    model.save().then(() => {
      this.toast.success(`Help document was successfully ${isNew ? 'created' : 'updated'}.`);
      this.entry = null;
      this.documents.update().then(() => this._sortDocuments());
    }).catch((response) => {
      this.house.handleErrorResponse(response);
      this.entry.rollbackAttributes();
    });
  }

  @action
  deleteHelp() {
    this.modal.confirm(`Confirm help document deletion`, `Are you sure you want to delete "${this.entry.slug}?"`,
      () => {
        this.entry.destroyRecord().then(() => {
          this.entry = null;
          this.toast.success(`Help document was successfully deleted.`);
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }

  _sortDocuments() {
    this.viewDocuments = this.documents.toArray().sortBy('slug');
  }
}
