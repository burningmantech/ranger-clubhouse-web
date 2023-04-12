import Component from '@glimmer/component';

export default class TicketGiftInfoComponent extends Component {
  get hasMultiple() {
    return this.args.ticketPackage.giftTickets.length > 1;
  }
}
