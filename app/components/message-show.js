import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class MessageShowComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked showReplyForm;
  //@tracked messageIsHidden = true;
  @tracked replyToMessage;

  constructor() {
    super(...arguments);

    //this.messageIsHidden = this.args.message.isHidden;
  }

  @action
  async toggleRead() {
    this.args.toggleRead(this.args.message);
  }

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
  }

  @action
  sendReply(model, isValid) {
    this.args.sendMessage(model, isValid, this.replySent, this.args.message, this.replyToMessage);
  }

  @action
  isLastMessage(idx) {
    const replies = this.args.message.replies.length;
    return this.args.message.isSenderPerson && (!replies || (replies === (idx + 1)));
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
    const {idNumber} = this.args.person;
    const {message} = this.args;

    return message.isUnread(idNumber) || message.unreadReplyCount(idNumber);
  }

  get messageIsHidden() {
    return this.args.message.isHidden;
  }

  get messageClasses() {
    return this.messageIsHidden ? 'message-hover border-secondary-subtle ' : 'message-opened border-success'
  }
}
