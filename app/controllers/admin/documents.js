import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class AdminDocumentsController extends ClubhouseController {
  @tracked editDocument = null;

  validations = {
    tag: [validatePresence(true)],
    description: [validatePresence(true)],
    body: [validatePresence(true)]
  }

  @action
  editAction(document) {
    this.editDocument = document;
  }

  @action
  newAction() {
    this.editDocument = this.store.createRecord('document');
  }

  @action
  cancelAction() {
    this.editDocument = null;
  }

  @action
  async saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.editDocument.isNew;
    if (await this.saveModel.save({model, message: 'Document was successfully saved.'})) {
      this.editDocument = null;
      if (isNew) {
        this.documents.update();
      }
    }
  }

  @action
  deleteAction() {
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this document?', async () => {
      try {
        await this.editDocument.destroyRecord();
        this.editDocument = null;
        this.toast.success('Document was successfully deleted.');
      } catch (response) {
        this.errors.handleErrorResponse(response);
      }
    });
  }
}
