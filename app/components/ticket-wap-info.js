import Component from '@glimmer/component';

export default class TicketWapInfoComponent extends Component {
  constructor() {
    super(...arguments);

    this.wap = this.args.ticketPackage.wap;
  }

  get isStaffCredentialBanked() {
    const {ticket} = this.args;

    return (ticket && ticket.isStaffCredential && ticket.isBanked );
  }

  get usingStaffCredential() {
    const {ticket} = this.args;

    return (ticket && ticket.isStaffCredential && (ticket.isClaimed || ticket.isSubmitted));
  }

  get claimedStaffCredential() {
    const {ticket} = this.args;

    return (ticket && ticket.isStaffCredential && ticket.isClaimed);
  }

  get allTicketsBanked() {
    const {tickets} = this.args.ticketPackage;
    return tickets.length === tickets.filter((t) => t.isBanked).length;
  }
}
