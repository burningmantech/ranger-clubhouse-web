import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import containsEmail from 'clubhouse/utils/contains-email';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class ContactFormComponent extends Component {
  @service house;
  @service toast;
  @service modal;
  @service ajax;

  @tracked isSending = false;

  contactValidation = {
    message: [ validatePresence({ presence: true,  message: 'Enter a message.' }) ],
  };

  contactForm = EmberObject.create({ message: '' });

  get title() {
    return `Send a contact message to ${this.args.callsign}`;
  }

  _sendMessage(message) {
    this.isSending = true;
    this.ajax.request('contact/send', {
      method: 'POST',
      data: {
        recipient_id: this.args.recipientId,
        message,
        type: this.args.contactType,
      }
    }).then(() => {
      this.toast.success(`Your message to ${this.args.callsign} has been sent.`);
      this.args.onDone(true);
    }).catch((response) => {
      this.house.handleErrorResponse(response, message);
    }).finally(() => {
      this.isSending = false;
    });
  }

  @action
  sendAction(form, isValid) {
    if (!isValid) {
      return;
    }

    const message = form.message.trim();

    if (!containsEmail(message)) {
      this.modal.confirm('No email address detected',
      'Huh, no email address was detected in your message. This might be a mistake. You may confirm to send the message, or cancel out and enter in an address.',
      () => { this._sendMessage(message); });
      return;
    }

    this._sendMessage(message);
  }

  @action
  cancelAction() {
    this.args.onDone(false);
  }
}
