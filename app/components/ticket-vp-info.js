import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class TicketVpInfoComponent extends Component {
  @argument('object') ticket;
  @argument('string') ticketingStatus;
  @argument('object') saveChoice;
  @argument('object') ticketingInfo;

  vpAction = '';

  @computed('ticket.status')
  get congratSentence() {
    const status = this.ticket.status;

    let verb = "you've qualified for a";
    let trailing = '';
    if (status == 'claimed') {
        verb = "you've claimed your";
    } else if (status == 'submitted') {
        verb = "we have submitted your";
        trailing = " to the Burning Man Ticket Request System";
    }

    return `${verb} ${this.ticket.typeHuman}${trailing}`;
  }
}
