import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class MessageThread extends Component {
  @service session;

  @cached
  get isMyMessage() {
    return this.args.person.idNumber === this.args.message.sender_person_id;
  }

  @cached
  get isMe() {
    return this.args.person.idNumber === this.session.userId;
  }

  @cached
  get hasBeenRead() {
    const {message} = this.args;
    return (this.isMyMessage && message?.delivered)
      || message?.replies?.some((r) => r.delivered);
  }

  @cached
  get messageClass() {
    return this.args.message.isTopMessage ? '' : "mt-1 pt-2 ms-xl-4";
  }
}
