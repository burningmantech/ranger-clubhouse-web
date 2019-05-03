import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

export default class AdminHelpController extends Controller {

  @computed('documents{[],@each.slug}')
  get viewDocuments() {
    return this.documents.sortBy('slug');
  }

  @action
  newHelp() {
    this.set('entry', this.store.createRecord('help'));
  }

  @action
  editHelp(help) {
    this.set('entry', help);
  }

  @action
  cancelHelp() {
    this.set('entry', null);
  }

  @action
  saveHelp(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.get('isNew');

    model.save().then((record) => {
      if (isNew) {
        this.documents.pushObject(record);
      }

      this.toast.success(`Help document was succesfully ${isNew ? 'created' : 'updated'}.`);
      this.set('entry', null);
    });
  }

  @action
  deleteHelp(help) {
    this.modal.confirm(`Confirm help document deletion`, `Are you sure you want to delete "${help.slug}?"`,
      () => {
        help.destroyRecord().then(() => {
          this.documents.removeObject(help);
        })
      });
  }
}
