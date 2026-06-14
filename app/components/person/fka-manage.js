import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class PersonFkaManageComponent extends Component {
  @service ajax;
  @service modal;
  @service errors;
  @service saveModel;
  @service store;
  @service toast;

  @tracked isManaging;
  @tracked isSubmitting;

  @tracked entry;

  validations = {
    fka: [validatePresence({presence: true, message: 'Please enter a FKA'})],
  };

  @action
  openManageDialog() {
    this.isManaging = true;
  }

  @action
  closeManageDialog() {
    return this.isManaging = false;
  }

  @action
  newFka() {
    this.entry = this.store.createRecord('person-fka', { person_id: this.args.person.id })
  }

  @action
  editFka(row) {
    this.entry = row;
  }

  @action
  cancelEdit() {
    this.entry = null;
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return;
    }

    const {isNew} = this.entry;
    if (await this.saveModel.save({model, message: 'The FKA was successfully saved.', owner: this})) {
      if (isNew) {
        await this.args.personFkas.update();
      }
      this.entry = null;
    }
  }

  @action
  deleteFka(row) {
    this.modal.confirm('Confirm Deletion',
      `Are you sure you want to delete "${row.fka}?`,
      async () => {
        this.isSubmitting = true;
        try {
          await row.destroyRecord();
          this.toast.success('The FKA was deleted.');
        } catch (response) {
          this.errors.handleErrorResponse(response)
        } finally {
          this.isSubmitting = false;
        }
      });
  }

}
