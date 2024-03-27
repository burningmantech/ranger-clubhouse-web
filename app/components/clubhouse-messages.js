import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {Role} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';

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
    return this.args.messages.reduce((total, msg) => (msg.delivered ? 0 : 1) + total, 0);
  }

  get readCount() {
    return this.args.messages.reduce((total, msg) => (msg.delivered ? 1 : 0) + total, 0);
  }

  @action
  updateUnreadCount() {
    const unreadCount = this.unreadCount;
    const {person} = this.args;
    if (person) {
      set(person, 'unread_message_count', unreadCount);
    }

    if (+this.session.userId === +person.id) {
      this.session.unreadMessageCount = unreadCount;
    }
  }

  _newMessageSetup(fields) {
    this.newMessage = this.store.createRecord('person-message', {
      recipient_callsign: '',
      message_from: '',
      subject: '',
      body: '',
      ...fields
    });
  }

  @action
  newMessageToAction() {
    this._newMessageSetup({recipient_callsign: this.args.person.callsign});
  }

  @action
  newMessageFromAction() {
    this._newMessageSetup({message_from: this.args.person.callsign});
  }

  @action
  replyToAction(message) {
    let {subject} = message;
    if (!subject.match(/^(re)[:-]?\s+/i, '')) {
      subject = `Re: ${subject}`;
    }

    this._newMessageSetup({
      subject,
      message_from: this.args.person.callsign,
      recipient_callsign: message.message_from,
      reply_to_id: message.id,
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
        if (+this.newMessage.person_id === this.session.userId) {
          this.args.messages.update().then(() => this.updateUnreadCount());
        }
        this.newMessage = null;
      }).finally(() => this.isSubmitting = false);
  }

  @action
  cancelAction() {
    this.newMessage = null;
  }
}
