import Controller from '@ember/controller';
import { action } from '@ember/object';

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

    if (!model.get('for_pnvs') && !model.get('for_auditors') && !model.get('for_rangers')) {
      this.modal.info(null, 'Check one or more audiences to show the message to.');
      return;
    }

    model.save().then(() => {
      this.toast.success(`MOTD was successfully ${isNew ? 'created' : 'updated'}.`);
      this.motds.update();
      this.set('entry', null);
    }).catch((response) => {
      this.house.handleErrorResponse(response);
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
