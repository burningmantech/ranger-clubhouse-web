import Component from '@glimmer/component';
import {DELIVERY_NONE} from 'clubhouse/models/access-document';

export default class TicketingClosedComponent extends Component {
  constructor() {
    super(...arguments);
    const {ticketPackage, person} = this.args;
    const ticket = ticketPackage.tickets.find((ticket) => ticket.isUsing);

    this.ticket = ticket;
    this.usingStaffCredential = (ticket && ticket.isStaffCredential && ticket.isUsing);
    this.usingRPT = (ticket && ticket.isReducedPriceTicket && ticket.isUsing);

    this.bankedItems = ticketPackage.tickets.filter((t) => (t.isBanked || t.isQualified))
      .concat(ticketPackage.provisions.filter((t) => t.isBanked));

    this.hasFullPackage = (!person.isAlpha && !person.isProspective);

    this.ticketNotClaimed = !ticket && !!ticketPackage.tickets.find((t) => t.isQualified);

    const banked =  ticketPackage.tickets.filter((t) => t.isBanked).length;
    this.allTicketsBanked = (banked.length && banked.length === ticketPackage.tickets.length);

    const {wap} = ticketPackage;
    this.wap = wap;
    this.usingWAP = (wap && wap.isUsing);

    const pass = ticketPackage.vehiclePass;
    this.usingVehiclePass = (pass && pass.isUsing);
    this.haveVP = (pass && (pass.isUsing || pass.isQualified));

    // Delivery method
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
  }
}
