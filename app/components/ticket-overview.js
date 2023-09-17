import Component from '@glimmer/component';
import {DELIVERY_NONE} from 'clubhouse/models/access-document';

/**
 * Build up a ticketing overview / summary for the user
 */
export default class TicketOverviewComponent extends Component {
  constructor() {
    super(...arguments);

    const {ticketPackage} = this.args;
    const ticket = ticketPackage.tickets.find((ticket) => ticket.isUsing);

    this.ticket = ticket;
    this.usingStaffCredential = (ticket && ticket.isStaffCredential && ticket.isUsing);

    // Does any SC exist regardless of status?
    this.haveStaffCredential = ticketPackage.tickets.find((ticket) => ticket.isStaffCredential);

    this.bankedTickets = ticketPackage.tickets.filter((t) => (t.isBanked || t.isQualified));

    // Is the ticket not claimed?
    this.ticketNotClaimed = !ticket && !!ticketPackage.tickets.find((t) => t.isQualified);

    const banked = ticketPackage.tickets.filter((t) => t.isBanked);
    this.allTicketsBanked = (banked.length && banked.length === ticketPackage.tickets.length);

    const {wap} = ticketPackage;
    this.wap = wap;

    const pass = ticketPackage.vehiclePass;
    this.usingVehiclePass = (pass && pass.isUsing);
    this.haveVP = (pass && (pass.isUsing || pass.isQualified));

    // Figure out if SPT or VP requires a delivery method?
    let item;
    if (ticket && ticket.isUsing) {
      item = ticket;
    } else if (pass && pass.isUsing) {
      item = pass;
    }

    if (item) {
      this.usingMail = item.isDeliveryPostal;
      this.usingWillCall = item.isDeliveryWillCall;
      this.address = item;
      this.deliveryMethod = item.delivery_method;
    } else {
      this.usingMail = false;
      this.usingWillCall = false;
      this.address = null;
      this.deliveryMethod = DELIVERY_NONE;
    }

    this.wapSOList = ticketPackage.wapso;

    // Find the effective WAP - either claimed SC or actual WAP.
    if (this.usingStaffCredential) {
      this.effectiveWAP = this.ticket;
    } else if (this.wap) {
      this.effectiveWAP = this.wap;
    } else {
      this.effectiveWAP = null;
    }

    this.usingWAP = (this.effectiveWAP && this.effectiveWAP.isUsing);

    this.giftTicketCount = ticketPackage.giftTickets.filter((t) => t.isClaimed || t.isSubmitted).length;
    this.giftVPCount = ticketPackage.giftVPs.filter((t) => t.isClaimed || t.isSubmitted).length;
    this.lsdTicketCount = ticketPackage.lsdTickets.filter((t) => t.isClaimed || t.isSubmitted).length;
    this.lsdVPCount = ticketPackage.lsdVPs.filter((t) => t.isClaimed || t.isSubmitted).length;
  }
}
