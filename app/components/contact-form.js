import Component from '@ember/component';
import EmberObject from '@ember/object';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional, unionOf } from '@ember-decorators/argument/types';

import containsEmail from 'clubhouse/utils/contains-email';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class ContactFormComponent extends Component {
  @argument('string') callsign;
  @argument('number') recipientId;
  @argument('string') contactType;
  @argument('object') onDone;
  @argument(optional('string')) personStatus;
  @argument(unionOf('boolean', 'number')) isInactive;

  isSending = false;

  contactValidation = {
    message: validatePresence({ presence: true,  message: 'Enter a message.' }),
  };

  contactForm = EmberObject.create({ message: '' });

  @computed('callsign')
  get title() {
    return `Send a contact message to ${this.callsign}`;
  }

  _sendMessage(message) {
    this.set('isSending', true);
    this.ajax.request('contact/send', {
      method: 'POST',
      data: {
        recipient_id: this.recipientId,
        message,
        type: this.contactType,
      }
    }).then(() => {
      this.toast.success(`Your message to ${this.callsign} has been sent.`);
      this.onDone(true);
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.set('isSending', false);
    });
  }

  @action
  sendAction(form, isValid) {
    if (!isValid) {
      return;
    }

    const message = form.get('message').trim();

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
    this.onDone(false);
  }
}
