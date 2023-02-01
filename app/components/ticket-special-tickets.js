import Component from '@glimmer/component';
import {GIFT_TICKET, LSD_TICKET} from 'clubhouse/models/access-document';

/**
 * Handle Late Season Directed and Gift Ticket offerings.
 */

export default class TicketOffersComponent extends Component {
  constructor() {
    super(...arguments);
    const pkg = this.args.ticketPackage;
    this.giftTickets = pkg.specialTickets.filter((t) => t.type === GIFT_TICKET);
    this.lsdTickets = pkg.specialTickets.filter((t) => t.type === LSD_TICKET);
    this.specialTicketsEnabled = pkg.specialTicketsEnabled;
    this.haveTickets = (this.giftTickets.length || this.lsdTickets.length);
  }

  get isMainTicketingOpen() {
    return this.args.ticketingInfo.period === 'open';
  }
}
