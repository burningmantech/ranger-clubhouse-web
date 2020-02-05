import Component from '@glimmer/component';
import {computed} from '@ember/object';

export default class TicketingOffseasonComponent extends Component {
  @computed('args.ticketPackage.tickets')
  get bankedTickets() {
    return this.args.ticketPackage.tickets.filter((ticket) => (ticket.status == 'banked' || ticket.status == 'qualified'));
  }

  get eventYear() {
    /*
     * grrr. months are 0 to 11. seriously?
     */
    const date = new Date();
    const month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (month >= 9) {
      year++;
    }

    return year;
  }
}
