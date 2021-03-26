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
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = this.editDocument.isNew;
    model.save().then(() => {
      this.editDocument = null;
      this.toast.success('Document was successfully saved.');
      if (isNew) {
        this.documents.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteAction() {
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this document?', () => {
      this.editDocument.destroyRecord().then(() => {
        this.editDocument = null;
        this.toast.success('Document was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }
}
