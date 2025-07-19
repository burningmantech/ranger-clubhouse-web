import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class MessageThread extends Component {
  @cached
  get isMyMessage() {
    return this.args.person.idNumber === this.args.message.sender_person_id;
  }

  @cached
  get hasBeenRead() {
    const {message} = this.args;
    return (this.isMyMessage && message.delivered)
      || message.replies.some((r) => r.delivered);
  }

  @cached
  get messageClass() {
    return this.args.message.isTopMessage ? '' : "mt-1 pt-2 ms-xl-4";
  }

  @cached
  get lastReply() {
    const {message} = this.args;

    return message.replies.length ? message.replies[message.replies.length - 1] : null;
  }

  @action
  onMessageClick() {
    const {message} = this.args;

    if (message.isTopMessage && message.isHidden) {
      this.args.onMessageClick();
    }
  }
}
