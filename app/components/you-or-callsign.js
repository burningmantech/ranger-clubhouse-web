import Component from '@glimmer/component';
import { service } from '@ember/service'

export default class YouOrCallsignComponent extends Component {
  @service session;

  get isMe() {
    return this.args.person.id == this.session.userId;
  }
}

