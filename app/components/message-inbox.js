import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import {MESSAGE_TYPE_CONTACT, MESSAGE_TYPE_NORMAL, SENDER_TYPE_PERSON} from "clubhouse/models/person-message";
import {ALLOW_TO_MESSAGE} from "clubhouse/constants/person_status";
import {pluralize} from 'ember-inflector';
import {TrackedArray} from 'tracked-built-ins';

export default class MessageInboxComponent extends Component {
  @service ajax;
  @service house;
  @service session;
  @service store;
  @service toast;

  @tracked isLoading;
  @tracked isSubmitting;

  @tracked openNewMessage = true;
  @tracked newMessage;
  @tracked messageToShow;

  @tracked messages = new TrackedArray([]);

  isRetrieving = false;

  // Keep track of the message that are open.
  messagesHidden = {};

  constructor() {
    super(...arguments);

    if (this.args.isContact) {
      this._newMessageSetup({to: this.args.contactCallsign, from: this.args.person.callsign});
    } else {
      this.session.loadMessages = this._loadMessages;
      this._loadMessages();
    }
  }

  willDestroy() {
    this.session.loadMessages = null;
    super.willDestroy(...arguments);
  }

  get canSendMessages() {
    return ALLOW_TO_MESSAGE.includes(this.session.user.status);
  }

  @action
  async _loadMessages() {
    if (this.isRetrieving) {
      return;
    }

    this.store.unloadAll('person-message');
    const personId = this.args.person.idNumber;

    this.isLoading = true;
    this.isRetrieving = true; // EmberJS get cranky when a tracked variable is read then written. here the second variable

    this.messages.forEach((message) => {
      this.messagesHidden[message.id] = message.isHidden;
    });
    try {
      const mailbox = await this.ajax.request('messages', {data: {person_id: personId}}).then(({person_message}) => person_message);
      this.messages = new TrackedArray(mailbox.map((message) => {
        message.personIdInbox = personId;
        if (this.messagesHidden[message.id] !== undefined) {
          message.isHidden = this.messagesHidden[message.id];
        }
        message.replies = new TrackedArray(
          message.replies.map((reply) => this.house.pushPayload('person-message', reply))
        );
        return this.house.pushPayload('person-message', message);
      }));
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isRetrieving = false;
      this.isLoading = false;
    }
  }

  @cached
  get unreadCount() {
    const info = [];
    if (this.unreadMessageCount) {
      info.push(pluralize(this.unreadMessageCount, 'unread message'));
    }

    if (this.unreadReplyCount) {
      info.push(pluralize(this.unreadReplyCount, 'unread reply'));
    }

    return info.join(' and ');
  }

  @cached
  get unreadMessageCount() {
    const personId = this.args.person.idNumber;
    let count = 0;

    this.messages.forEach((message) => {
      if (message.sender_person_id !== personId && !message.delivered) {
        count++;
      }
    });

    return count;
  }

  @cached
  get unreadReplyCount() {
    let count = 0;

    this.messages.forEach((message) => {
      count += message.unreadReplyCount(this.args.person.idNumber);
    });

    return count;
  }

  @action
  isAnyUnread(message) {
    const {id} = this.args.person;
    if (message.sender_person_id !== id && !message.delivered) {
      return true;
    }

    return message.replies?.some(reply => reply.sender_person_id !== id && !reply.delivered);
  }

  @action
  updateUnreadCount() {
    const {person} = this.args;

    const count = this.unreadMessageCount + this.unreadReplyCount;
    if (person) {
      set(person, 'unread_message_count', count);
    }

    if (this.session.userId === person.idNumber) {
      this.session.unreadMessageCount = count;
    }
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
    return this._newMessageSetup({
      from: this.args.person.callsign,
      to: topMessage.message_from,
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
  async sendMessage(model, isValid, callback = null, topMessage = null, record = null) {
    if (!isValid) {
      return;
    }
    const personId = this.args.person.idNumber;
    this.isSubmitting = true;
    try {
      await model.save();
      this.toast.success(`Message successfully sent`);

      if (!this.args.isContact) {
        if (topMessage) {
          topMessage.replies.push(record);
        } else {
          this.messages.unshift(record);
        }
      }

      if (!this.args.isContact && this.session.userId === personId) {
        this.updateUnreadCount();
      }

      if (this.args.onFinished) {
        this.args.onFinished();
      } else {
        callback?.();
      }
      this.newMessage = null;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  cancelNewMessage() {
    this.newMessage = null;
    this.args.onFinished?.();
  }

  @action
  async toggleRead(message) {
    const personId = this.args.person.idNumber;
    try {
      this.isSubmitting = true;
      message.delivered = !message.delivered;
      await this.ajax.patch(`messages/${message.id}/markread`, {
        data: {person_id: personId, delivered: message.delivered}
      })
      this.toast.success(`Message has been marked as ${message.delivered ? 'read' : 'unread'}`);
      this.updateUnreadCount();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
