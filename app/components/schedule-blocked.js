import Component from '@glimmer/component';
import {service} from '@ember/service';

export default class ScheduleBlockedComponent extends Component {
  @service session;

  get isMe() {
    return this.session.userId == this.person.id;
  }
}
