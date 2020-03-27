import Component from '@glimmer/component';
import eventYear from 'clubhouse/utils/event-year';

export default class TicketingOffseasonComponent extends Component {
  get bankedTickets() {
    return this.args.ticketPackage.tickets.filter((ticket) => (ticket.status == 'banked' || ticket.status == 'qualified'));
  }

  get eventYear() {
    return eventYear();
  }
}
