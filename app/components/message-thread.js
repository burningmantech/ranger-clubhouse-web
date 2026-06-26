import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class MessageThread extends Component {
  @service session;

  @cached
  get isMe() {
    return this.args.person.idNumber === this.session.userId;
  }

  @cached
  get hasBeenRead() {
    const {message, person} = this.args;
    const pid = person?.idNumber;
    // Single source of truth: read == not unread by this person and no unread replies.
    return !message.isUnread(pid) && message.unreadReplyCount(pid) === 0;
  }

  @cached
  get messageClass() {
    return this.args.message.isTopMessage ? '' : 'mt-1 pt-2 ms-xl-4';
  }
}
