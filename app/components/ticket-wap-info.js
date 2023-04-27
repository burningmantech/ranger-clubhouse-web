import Component from '@glimmer/component';

export default class TicketWapInfoComponent extends Component {
  constructor() {
    super(...arguments);

    this.wap = this.args.ticketPackage.wap;
  }

  /**
   * Did the SC get banked?
   *
   * @returns {boolean}
   */

  get isStaffCredentialBanked() {
    const {ticket} = this.args;

    return !!(ticket && ticket.isStaffCredential && ticket.isBanked );
  }

  /**
   * Is the SC being used?
   *
   * @returns {boolean}
   */

  get usingStaffCredential() {
    const {ticket} = this.args;

    return !!(ticket && ticket.isStaffCredential && (ticket.isClaimed || ticket.isSubmitted));
  }

  /**
   * Was the SC not claimed?
   *
   * @returns {boolean}
   */

   get noStaffCredentialClaimed() {
    const {ticket} = this.args;

    return !(ticket && ticket.isStaffCredential && ticket.isClaimed);
  }

  /**
   * Were all the tickets banked?
   *
   * @returns {boolean}
   */

  get allTicketsBanked() {
    const {tickets} = this.args.ticketPackage;
    return tickets.length && tickets.length === tickets.filter((t) => t.isBanked).length;
  }

  /**
   * Any tickets still in a qualified state (not claimed, submitted, or banked)
   *
   * @returns {boolean}
   */

  get noTicketsTouched() {
    const {tickets} = this.args.ticketPackage;
    return tickets.length && !tickets.find((t) => t.isUsing || t.isBanked);
  }
}
