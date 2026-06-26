import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {PersonMessageReplyValidations} from 'clubhouse/validations/person-message';

export default class MessageShowComponent extends Component {
  @service session;

  @tracked showReplyForm = false;
  @tracked replyToMessage = null;

  replyValidations = PersonMessageReplyValidations;

  @action
  openReplyForm() {
    this.replyToMessage = this.args.createReplyMessage(this.args.message);
    this.showReplyForm = true;
  }

  @action
  cancelReply() {
    this.showReplyForm = false;
    this.replyToMessage = null;
  }

  @action
  replySent() {
    this.showReplyForm = false;
    this.replyToMessage = null;
  }

  @action
  sendReply(model, isValid) {
    this.args.sendMessage(model, isValid, {
      onSuccess: this.replySent,
      topMessage: this.args.message,
      record: this.replyToMessage,
    });
  }

  @action
  isLastMessage(idx) {
    // Always called from within {{#each replies}}, so there is at least one reply;
    // the message is last when its index is the final one.
    return this.args.message.isSenderPerson && (idx + 1 === this.args.message.replies.length);
  }

  @action
  messageOpen() {
    this.args.message.isHidden = false;
  }

  @action
  closeMessage() {
    this.args.message.isHidden = true;
  }

  get haveUnread() {
    const idNumber = this.args.person?.idNumber;
    if (idNumber == null) {
      return false;
    }
    const {message} = this.args;

    return message.isUnread(idNumber) || message.unreadReplyCount(idNumber) > 0;
  }

  get messageIsHidden() {
    return this.args.message.isHidden;
  }

  get messageClasses() {
    return this.messageIsHidden ? 'message-hover border-secondary-subtle' : 'message-opened border-success'
  }
}
