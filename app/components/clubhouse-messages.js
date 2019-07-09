import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

import { Role } from 'clubhouse/constants/roles';

export default class ClubhouseMessagesComponent extends Component {
  @argument('object') person;
  @argument('object') messages;

  @service store;

  filterMessages = 'all';
  isSubmitting = false;
  newMessage = null;

  @computed('messages', 'filterMessages')
  get viewMessages() {
    const messages = this.messages;
    const filterMessages = this.filterMessages;

    switch (filterMessages) {
      case 'read':
        return messages.filterBy('delivered', true);

      case 'unread':
        return messages.filterBy('delivered', false);

      default:
        return messages;
    }
  }

  @computed('messages.@each.delivered')
  get unreadCount() {
    return this.messages.reduce(function(total, msg) { return (msg.delivered ? 0 : 1)+total;}, 0);
  }

  @computed('messages.@each.delivered')
  get readCount() {
    return this.messages.reduce(function(total, msg) { return (msg.delivered ? 1 : 0)+total;},0);
  }

  @computed('session.user')
  get canSendMessages() {
    return this.session.user.hasRole([ Role.ADMIN, Role.MANAGE, Role.TRAINER, Role.VC]);
  }

  _updateUnreadCount() {
    const unreadCount = this.unreadCount;
    this.person.set('unread_message_count', this.unreadCount);
    if (this.session.userId == this.person.id) {
      this.session.user.set('unread_message_count', unreadCount);
    }
  }

  @action
  markReadAction(message) {
    return message.markRead().then(() => {
      message.set('delivered', true);
      this._updateUnreadCount();
    })
  }

  @action
  newMessageAction() {
    this.set('newMessage', this.store.createRecord('person-message', {
          recipient_callsign: '',
          message_from: this.person.callsign,
          subject: '',
          body: ''
    }));
  }

  @action
  submitAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.set('isSubmitting', true);

    this.house.saveModel(model, `Message successfully sent to ${model.get('recipient_callsign')}.`, () => {
      if (this.newMessage.person_id == this.session.userId) {
        this.messages.update().then(() => {
          this._updateUnreadCount();
        });
      }
      this.set('newMessage', null);
    }).finally(() => {
      this.set('isSubmitting', false);
    });
  }

  @action
  cancelAction() {
    this.set('newMessage', null);
  }
}
