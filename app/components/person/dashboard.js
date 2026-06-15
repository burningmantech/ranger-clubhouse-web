import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action }from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonDashboardComponent extends Component {
  @service ajax;
  @service errors;
  @service modal;

  @tracked isLoading = true;
  @tracked milestones;
  @tracked photo;

  constructor() {
    super(...arguments);

    this._loadDashboard();
  }

  async _loadDashboard() {
    const personId = this.args.person.id;
    try {
      const {milestones} = await this.ajax.request(`person/${personId}/milestones`);
      this.milestones = milestones;
      const {photo} = await this.ajax.request(`person/${personId}/photo`);
      this.photo = photo;
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  noButtonAction() {
    this.modal.info('Button Disabled', 'The button can only be used by the logged in user.');
  }
}

