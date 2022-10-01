import Component from '@glimmer/component';
import eventYear from 'clubhouse/utils/event-year';

export default class TicketingOffseasonComponent extends Component {
  constructor() {
    super(...arguments);
    const {ticketPackage} = this.args;
    this.tickets = ticketPackage.tickets.filter((ticket) => (ticket.isBanked || ticket.isQualified));
    this.provisions = ticketPackage.provisions.filter((p) => (p.isBanked || p.isAvailable))
    this.eventYear = eventYear();
  }
}
