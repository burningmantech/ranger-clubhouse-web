import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { config } from 'clubhouse/utils/config';

export default class TicketInfoComponent extends Component {
  // User choice placed into ticketAction
  ticketAction = '';

  @argument('object') ticketList;
  @argument(optional('object')) ticket;
  @argument(optional('string')) ticketingStatus;
  @argument('object') saveChoice;
  @argument('object') ticketingInfo;

  @computed()
  get workedYear() {
    return parseInt(config('YrTicketThreshold')) - 1;
  }

  @computed('ticket.status')
  get congratSentence() {
    const ticket = this.ticket;
    let verb = "";
    let trailing = "";

    switch (ticket.status) {
      case 'claimed':
        verb = "You've claimed your";
        break;
      case 'banked':
        verb = 'You have a banked';
        break;
      case 'submitted':
        verb = "We have submitted your";
        trailing = " to the Burning Man Ticket Request System";
        break;
      default:
        verb = "You've qualified for a";
        break;
    }

    return `${verb} ${ticket.typeHuman}${trailing}`;
  }
}
