import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class OnlineTrainingLaunchComponent extends Component {
  @service house;
  @service ajax;

  @tracked showCreationDialog = false;
  @tracked showExodusDialog = false;
  @tracked showErrorDialog = false;
  @tracked showDownForMaintenanceDialog = false;

  @tracked username = null;
  @tracked password = null;
  @tracked alreadyExists = false;

  @tracked isSubmitting = false;

  @action
  async setupAccountAction() {
    const {person} = this.args;

    this.showCreationDialog = true;
    this.isSubmitting = true;

    try {
      const result = await this.ajax.request(`online-training/${person.id}/setup`, {method: 'POST'});
      if (result.status === 'down-for-maintenance') {
        this.showDownForMaintenanceDialog = true;
      } else {
        this.showExodusDialog = true;
        if (result.status === 'exists') {
          this.alreadyExists = true;
          this.username = result.username;
        } else {
          this.password = result.password;
          this.username = result.username;
        }
      }
    } catch {
      this.showErrorDialog = true;
    } finally {
      this.isSubmitting = false;
      this.showCreationDialog = false;

    }
  }

  @action
  launchTrainingAction() {
    this.isSubmitting = true;
    window.location.href = this.args.url + `?username=${this.username}`;
  }

  @action
  closeAction() {
    this.showErrorDialog = false;
  }

  @action
  closeDownForMaintenance() {
    this.showDownForMaintenanceDialog = false;
  }

  @action
  async resetPasswordAccount() {
    this.isSubmitting = true;
    try {
      const {
        status,
        password
      } = await this.ajax.request(`online-training/${this.args.person.id}/reset-password`, {method: 'POST'});
      if (status === 'no-account') {
        this.toast.error('Account is NOT setup');
      } else if (status === 'success') {
        this.password = password;
      } else {
        this.toast.error(`Unknown status [${status}]`);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
