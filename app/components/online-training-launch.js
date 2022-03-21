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

  @tracked username = null;
  @tracked password = null;
  @tracked alreadyExists = false;

  @tracked isSubmitting = false;

  @action
  setupAccountAction() {
    const person = this.args.person;

    this.showCreationDialog = true;
    this.isSubmitting = true;
    this.ajax.request(`online-training/${person.id}/setup`, {method: 'POST'})
      .then((result) => {
        if (result.status === 'exists') {
          this.alreadyExists = true;
          this.username = result.username;
        } else {
          this.password = result.password;
          this.username = result.username;
        }
        this.expiryDate = result.expiry_date;
        this.showExodusDialog = true;
      }).catch(() => this.showErrorDialog = true)
      .finally(() => {
        this.isSubmitting = false;
        this.showCreationDialog = false;
      });
  }

  @action
  launchTrainingAction() {
    this.isSubmitting = true;
    window.location.href = this.args.url;
  }

  @action
  closeAction() {
    this.showErrorDialog = false;
  }
}
