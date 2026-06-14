import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {cached, tracked} from '@glimmer/tracking';
import {
  isMessageUnread,
  MESSAGE_TYPE_CONTACT,
  MESSAGE_TYPE_NORMAL,
  SENDER_TYPE_PERSON
} from "clubhouse/models/person-message";
import {ALLOW_TO_MESSAGE} from "clubhouse/constants/person_status";
import {pluralize} from 'ember-inflector';
import {TrackedArray} from 'tracked-built-ins';

export default class MessageInboxComponent extends Component {
  @service ajax;
  @service errors;
  @service storePayload;
  @service saveModel;
  @service session;
  @service store;
  @service toast;

  @tracked isLoading;
  @tracked isSubmitting;

  @tracked newMessage;

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
      const {person_message: mailbox} = await this.ajax.request('messages', {data: {person_id: personId}});
      this.messages = new TrackedArray(mailbox.map((message) => {
        message.personIdInbox = personId;
        if (this.messagesHidden[message.id] !== undefined) {
          message.isHidden = this.messagesHidden[message.id];
        }
        message.replies = new TrackedArray(
          (message.replies ?? []).map((reply) => this.storePayload.pushPayload('person-message', reply))
        );
        return this.storePayload.pushPayload('person-message', message);
      }));
    } catch (response) {
      this.errors.handleErrorResponse(response);
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
      if (isMessageUnread(message, personId)) {
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
  async sendMessage(model, isValid, {onSuccess = null, topMessage = null, record = null} = {}) {
    if (!isValid) {
      return;
    }
    const personId = this.args.person.idNumber;
    if (await this.saveModel.save({model, message: `Message successfully sent`, owner: this})) {
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
        onSuccess?.();
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
      this.errors.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
