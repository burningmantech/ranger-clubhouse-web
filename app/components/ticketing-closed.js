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
      .concat(ticketPackage.appreciations.filter((t) => (t.isBanked || t.isQualified)));

    this.hasFullPackage = (!person.isAlpha && !person.isProspective);

    this.ticketNotClaimed = !ticket && !!ticketPackage.tickets.find((t) => t.isQualified);

    const wap = ticketPackage.wap;
    this.wap = ticketPackage.wap;
    this.usingWAP = (wap && wap.isUsing);

    const pass = ticketPackage.vehicle_pass;
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
      this.usingMail = item.isDeliveryMail;
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
