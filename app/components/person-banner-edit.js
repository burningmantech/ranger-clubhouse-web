import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class PersonBannerEdit extends Component {
  @service house;
  @service modal;
  @service toast;

  @tracked isSubmitting = false;

  permanentOptions = [
    ["Event Only: message will disappear sometime before the year's end", false],
    ["Permanent: message will be shown until it is manually deleted", true]
  ];

  validations = {
    message: [validatePresence({presence: true, message: 'Enter a message.'})],
  }

  @action
  async save(model, isValid) {
    if (!isValid)
      return;

    this.isSubmitting = true;
    try {
      await model.save();
      this.toast.success(`Person note was successfully save.`);
      this.args.onFinished(true);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  deleteBanner() {
    this.modal.confirm(`Confirm deletion`,
      `Are you sure you want to delete this note?`,
      async () => {
        try {
          this.isSubmitting = true;
          await this.args.entry.destroyRecord(true);
          this.toast.success(`Banner message was successfully deleted.`);
          this.args.onFinished();
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

}
