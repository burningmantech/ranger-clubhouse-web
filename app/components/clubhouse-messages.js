import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {inject as service} from '@ember/service';
import {Role} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';
import $ from 'jquery';

export default class ClubhouseMessagesComponent extends Component {
  @service store;
  @service house;
  @service session;
  @service ajax;

  @tracked isSubmitting = false;
  @tracked newMessage = null;

  constructor() {
    super(...arguments);

    this.canSendMessages = this.session.hasRole([Role.ADMIN, Role.MANAGE]);
  }

  get unreadCount() {
    return this.args.messages.reduce(function (total, msg) {
      return (msg.delivered ? 0 : 1) + total;
    }, 0);
  }

  get readCount() {
    return this.args.messages.reduce(function (total, msg) {
      return (msg.delivered ? 1 : 0) + total;
    }, 0);
  }

  _updateUnreadCount() {
    const unreadCount = this.unreadCount;
    const person = this.args.person;
    if (person) {
      set(person, 'unread_message_count', unreadCount);
    }

    if (this.session.userId == person.id) {
      this.session.unreadMessageCount = unreadCount;
    }
  }

  @action
  toggleMessage(message, event) {
    event.preventDefault();
    set(message, 'showing', !message.showing);
    $(`#message-text-${message.id}`).collapse('toggle');
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
    set(message, 'isSubmitting', true);
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
