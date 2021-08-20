import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';

export default class AdminRolesController extends ClubhouseController {
  @tracked entry = null;

  get canManageRoles() {
    return this.session.hasRole(TECH_NINJA);
  }

  @action
  editRole(role) {
    this.entry = role;
  }

  @action
  removeRole() {
    this.modal.confirm('Delete Role', `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The role has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  saveRole(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The role has been ${model.isNew ? 'created' : 'updated'}.`, () => {
      this.entry = null;
      this.roles.update(); // refresh the list.
    });
  }

  @action
  cancelRole() {
    this.entry = null;
  }
}
