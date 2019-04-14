import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class AdminMotdController extends Controller {
  @action
  newEntry() {
    this.set('entry', this.store.createRecord('motd'));
  }

  @action
  cancelEntry() {
    this.set('entry', null);
  }

  @action
  editEntry(motd) {
    this.set('entry', motd);
  }

  @action
  saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }
    const isNew = this.entry.isNew;

    model.save().then(() => {
      this.toast.success(`MOTD was successfully ${isNew ? 'created' : 'updated'}.`);
      this.motds.update();
      this.set('entry', null);
    });
  }

  @action
  deleteEntry(motd) {
    this.modal.confirm('Remove MOTD entry', 'Are you sure?', () => {
      motd.destroyRecord().then(() => {
        this.toast.success('MOTD has been removed.');
      });
    });
  }
}
