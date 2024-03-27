import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class PersonMessageComponent extends Component {
  @service ajax;
  @service house;
  @tracked isSubmitting = false;
  @tracked isOpened = false;

  @action
  toggleMessage() {
    this.isOpened = !this.isOpened;
  }

  @action
  async toggleRead() {
    const {message} = this.args;

    try {
      const delivered = !message.delivered;
      this.isSubmitting = true;
      await this.ajax.patch(`messages/${message.id}/markread`, {
        data: {delivered}
      });
      message.delivered = delivered;
      this.args.updateUnreadCount();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
