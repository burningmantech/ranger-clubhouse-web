import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AdminRolesController extends Controller {
  entry = null;

  @action
  editRole(role) {
    this.set('entry', role);
  }

  @action
  newRole() {
    this.set('entry', this.store.createRecord('role'));
  }

  @action
  removeRole(role) {
    this.modal.confirm('Delete Role', `Are you sure you wish to delete "${role.title}"? This operation cannot be undone.`, () => {
      role.destroyRecord().then(() => {
        this.toast.success('The role has been deleted.');
      })
    })
  }

  @action
  saveRole(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The role has been ${model.get('isNew') ? 'created' : 'updated'}.`, () => {
      this.set('entry', null);
      this.roles.update(); // refresh the list.
    })
  }

  @action
  cancelRole(model) {
    if (!model.get('isDirty')) {
      this.set('entry', null);
      return;
    }

    this.modal.confirm('Unsaved changes', 'The role has unsaved changed. Are you sure you wish to cancel?', () => {
      this.set('entry', null);
    })
  }
}
