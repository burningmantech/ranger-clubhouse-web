import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember/object';

export default class TicketingOffseasonComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;

  @computed('ticketPackage.tickets')
  get bankedTickets() {
    return this.ticketPackage.tickets.filter((ticket) => (ticket.status == 'banked' || ticket.status == 'qualified'));
  }
}
