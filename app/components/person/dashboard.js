import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action }from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonDashboardComponent extends Component {
  @service ajax;
  @service house;
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
      this.milestones = await this.ajax.request(`person/${personId}/milestones`).then(({milestones}) => milestones);
      this.photo = await this.ajax.request(`person/${personId}/photo`).then(({photo}) => photo);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  noButtonAction() {
    this.modal.info('Button Disabled', 'The button can only be used by the logged in user.');
  }
}

