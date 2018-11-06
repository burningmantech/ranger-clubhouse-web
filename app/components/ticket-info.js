import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class TicketInfoComponent extends Component {
  // User choice placed into ticketAction
  ticketAction = '';

  @argument ticketList;
  @argument ticket;
  @argument ticketingStatus;
  @argument saveChoice;
  @argument ticketingInfo;

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
