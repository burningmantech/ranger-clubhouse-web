import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import { tracked } from "@glimmer/tracking";
import { action } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class AdminOauthClientController extends ClubhouseController {
  @tracked clients;
  @tracked entry;
  @tracked isSubmitting = false;

  validations={
    client_id: [ validatePresence({presence: true, message: 'Enter the OAuth Client ID' }) ],
    description: [ validatePresence({presence: true, message: 'Enter a description' }) ],
  }

  @action
  newEntry() {
    this.entry = this.store.createRecord('oauth-client');
  }

  @action
  editEntry(entry) {
    this.entry = entry;
  }

  @action
  cancelEntry() {
    this.entry = null;
  }

  @action
  async saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      const {isNew} = this.entry;
      await model.save();
      if (isNew) {
        this.clients.update();
      }
      this.entry = null;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async deleteEntry(entry) {
    this.modal.confirm('Confirm Delete OAuth Client',
      'This operation cannot be undone. Are you sure you want to delete this client?',
      async () => {
        try {
          await entry.destroyRecord();
          this.entry = null;
          this.toast.success('The document was successfully deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response)
        }
      });
  }
}
