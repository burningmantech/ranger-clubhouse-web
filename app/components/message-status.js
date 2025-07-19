import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class MessageStatus extends Component {
  @cached
  get unreadReplyCount() {
    return this.args.message.unreadReplyCount(this.args.person.idNumber);
  }

  get isUnread() {
    return this.args.message.isUnread(this.args.person.idNumber);
  }
}
