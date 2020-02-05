import Component from '@glimmer/component';
import {computed} from '@ember/object';

export default class TicketingOffseasonComponent extends Component {
  @computed('args.ticketPackage.tickets')
  get bankedTickets() {
    return this.args.ticketPackage.tickets.filter((ticket) => (ticket.status == 'banked' || ticket.status == 'qualified'));
  }

  /*
   * Get the event year - September or later refers to the upcoming year's event.
   */

  get eventYear() {
    const date = new Date();
    const year = date.getFullYear();

    return date.getMonth() >= 8 ? year + 1 : year;
  }
}
