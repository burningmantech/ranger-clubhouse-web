import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject, {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';

export default class AdminRolesController extends ClubhouseController {
  @tracked entry = null;
  @tracked roles;
  @tracked art_positions;
  @tracked artForm;
  @tracked isSubmitting;
  @tracked artResults;

  get canManageRoles() {
    return this.session.hasRole(TECH_NINJA);
  }

  @cached
  get artOptions() {
    const options = this.art_positions.map((position) => [position.title, position.id]);
    options.unshift(['-', null]);
    return options;
  }

  @action
  createARTRoles() {
    this.artForm = EmberObject.create({position_id: null});
  }

  @action
  cancelARTRoles() {
    this.artForm = null;
  }

  @action
  async submitARTRoles(model, isValid) {
    if (!isValid) {
      return;
    }

    if (!model.position_id) {
      this.modal.info('No Position Selected', 'You did not select a position to create the backing ART permissions');
      return;
    }

    try {
      this.isSubmitting = true;
      this.artResults = await this.ajax.post('role/create-art-roles', {data: {position_id: +model.position_id}});
      await this.roles.update(); // refresh the list.
      this.artForm = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = true;
    }
  }

  @action
  closeARTResults() {
    this.artResults = null;
  }

  @action
  editRole(role) {
    this.entry = role;
  }

  @action
  removeRole() {
    this.modal.confirm('Delete Permission',
      `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`,
      async () => {
        try {
          this.isSubmitting = true;
          await this.entry.destroyRecord();
          this.toast.success('The role has been deleted.');
          this.entry = null;
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  saveRole(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    this.house.saveModel(model,
      `The permission has been ${model.isNew ? 'created' : 'updated'}.`,
      async () => {
        this.entry = null;
        try {
          await this.roles.update(); // refresh the list.
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      },
      () => this.isSubmitting = false);
  }

  @action
  cancelRole() {
    this.entry = null;
  }
}
