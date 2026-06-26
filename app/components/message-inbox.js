import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {
  MESSAGE_TYPE_CONTACT,
  MESSAGE_TYPE_NORMAL,
  SENDER_TYPE_PERSON
} from "clubhouse/models/person-message";
import {ALLOW_TO_MESSAGE} from "clubhouse/constants/person_status";
import {pluralize} from 'ember-inflector';

export default class MessageInboxComponent extends Component {
  @service('messages') mailbox;
  @service session;
  @service store;

  @tracked newMessage = null;

  constructor() {
    super(...arguments);

    if (this.args.isContact) {
      this._newMessageSetup({to: this.args.contactCallsign, from: this.args.person?.callsign});
    } else {
      // Register this inbox as the session's refresh target; restored on teardown
      // only if we're still the registered owner (don't clobber a later inbox).
      this.session.loadMessages = this.refresh;
      this.refresh();
    }
  }

  willDestroy() {
    if (this.session.loadMessages === this.refresh) {
      this.session.loadMessages = null;
    }
    super.willDestroy(...arguments);
  }

  get canSendMessages() {
    return ALLOW_TO_MESSAGE.includes(this.session.user.status);
  }

  // Thin view bindings over the MessagesService.
  get messages() {
    return this.mailbox.messages;
  }

  get isLoading() {
    return !this.args.isContact && this.mailbox.isLoading;
  }

  get isSending() {
    return this.mailbox.isSending;
  }

  get isMarkingRead() {
    return this.mailbox.isMarkingRead;
  }

  get unreadCount() {
    const {messages, replies} = this.mailbox.unreadCounts(this.args.person?.idNumber);
    const info = [];
    if (messages) {
      info.push(pluralize(messages, 'unread message'));
    }
    if (replies) {
      info.push(pluralize(replies, 'unread reply'));
    }
    return info.join(' and ');
  }

  @action
  refresh() {
    return this.mailbox.load(this.args.person?.idNumber);
  }

  @action
  updateUnreadCount() {
    this.mailbox.pushUnreadToOwner(this.args.person);
  }

  _newMessageSetup(initialName, isReply = false) {
    const message = this.store.createRecord('person-message', {
      sender_type: SENDER_TYPE_PERSON,
      message_type: (this.args.isMe || this.args.isContact) ? MESSAGE_TYPE_CONTACT : MESSAGE_TYPE_NORMAL,
      recipient_callsign: initialName.to,
      message_from: initialName.from,
      subject: '',
      body: '',
    });

    if (isReply) {
      message.reply_to_id = initialName.replyId;
      message.subject = initialName.subject;
    } else {
      this.newMessage = message;
    }

    return message;
  }

  @action
  createReplyMessage(topMessage) {
    const isOutgoing = this.args.person.idNumber === topMessage.sender_person_id;
    const to = isOutgoing
      ? (topMessage.person?.callsign ?? topMessage.message_from)
      : (topMessage.sender_person?.callsign ?? topMessage.fromName);

    return this._newMessageSetup({
      from: this.args.person.callsign,
      to,
      subject: topMessage.subject,
      replyId: topMessage.id,
    }, true);
  }

  @action
  newMessageTo() {
    this._newMessageSetup({to: this.args.person.callsign});
  }

  @action
  newMessageFrom() {
    this._newMessageSetup({from: this.args.person.callsign});
  }

  @action
  newMessageBoth() {
    this._newMessageSetup({});
  }

  @action
  async sendMessage(model, isValid, options = {}) {
    const ok = await this.mailbox.send(model, isValid, {
      ...options,
      isContact: this.args.isContact,
      person: this.args.person,
    });

    if (ok) {
      if (this.args.onFinished) {
        this.args.onFinished();
      } else {
        options.onSuccess?.();
      }
      this.newMessage = null;
    }
  }

  @action
  cancelNewMessage() {
    this.newMessage = null;
    this.args.onFinished?.();
  }

  @action
  toggleRead(message) {
    return this.mailbox.markRead(this.args.person, message);
  }
}
