import Component from '@glimmer/component';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {Role} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';

export default class ClubhouseMessagesComponent extends Component {
  @service store;
  @service house;
  @service session;
  @service ajax;

  @tracked filterMessages = 'all';
  @tracked isSubmitting = false;
  @tracked newMessage = null;

  get viewMessages() {
    const messages = this.args.messages;

    switch (this.filterMessages) {
      case 'read':
        return messages.filterBy('delivered', true);

      case 'unread':
        return messages.filterBy('delivered', false);

      default:
        return messages;
    }
  }

  @computed('args.messages.@each.delivered')
  get unreadCount() {
    return this.args.messages.reduce(function (total, msg) {
      return (msg.delivered ? 0 : 1) + total;
    }, 0);
  }

  @computed('args.messages.@each.delivered')
  get readCount() {
    return this.args.messages.reduce(function (total, msg) {
      return (msg.delivered ? 1 : 0) + total;
    }, 0);
  }

  get canSendMessages() {
    return this.session.user.hasRole([Role.ADMIN, Role.MANAGE, Role.TRAINER, Role.VC]);
  }

  _updateUnreadCount() {
    const unreadCount = this.unreadCount;
    const person = this.args.person;
    person.set('unread_message_count', this.unreadCount);
    if (this.session.userId == person.id) {
      this.session.user.set('unread_message_count', unreadCount);
    }
  }

  @action
  markReadAction(message, event) {
    event.preventDefault();
    this._markMessage(message, true);
  }

  @action
  markUnreadAction(message, event) {
    event.preventDefault();
    this._markMessage(message, false);
  }

  _markMessage(message, delivered) {
    message.set('isSubmitting', true);
    this.ajax.request(`messages/${message.id}/markread`, {
      method: 'PATCH',
      data: {delivered}
    }).then(() => {
      message.delivered = delivered;
      this._updateUnreadCount();
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => message.set('isSubmitting', false));
  }

  @action
  newMessageAction(event) {
    event.preventDefault();
    this.newMessage = this.store.createRecord('person-message', {
      recipient_callsign: '',
      message_from: this.args.person.callsign,
      subject: '',
      body: ''
    });
  }

  @action
  submitAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;

    this.house.saveModel(model, `Message successfully sent to ${model.recipient_callsign}.`,
      () => {
        if (this.newMessage.person_id == this.session.userId) {
          this.args.messages.update().then(() => this._updateUnreadCount());
        }
        this.newMessage = null;
      }).finally(() => this.isSubmitting = false);
  }

  @action
  cancelAction() {
    this.newMessage = null;
  }
}
