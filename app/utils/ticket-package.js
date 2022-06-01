import {tracked, cached} from '@glimmer/tracking';
//import { DELIVERY_NONE } from 'clubhouse/models/access-document-delivery';

export default class TicketPackage {
  @tracked wapso; // WAP-SOs will change in length based on how the user's ticketing decisions.

  constructor(pkg, person_id, house) {
    const docs = pkg.access_documents.map((ad) => house.pushPayload('access-document', ad));

    this.accessDocuments = docs;
    this.tickets = docs.filter((d) => d.isTicket);
    this.vehiclePass = docs.find((d) => d.isVehiclePass);
    this.wap = docs.find((d) => d.isWAP);
    this.wapso = docs.filter((d) => d.isWAPSO);
    this.provisions = docs.filter((d) => d.isProvision).sort((a, b) => a.typeLabel.localeCompare(b.typeLabel));

    this.year_earned = pkg.year_earned;
    this.credits_earned = pkg.credits_earned;
  }

  /**
   * Find the ticket
   *
   * - For multiple tickets on file, find the one that has been claimed
   * ( <TicketInfo> will deal with multiples, all other ticketing components want a single ticket)
   * - Otherwise use the single ticket if it exists
   *
   * @returns {AccessDocumentModel|null}
   */

  @cached
  get ticket() {
    const {tickets} = this;

    if (tickets.length > 1) {
      return tickets.find((t) => t.isUsing);
    } else if (tickets.length === 1) {
      return tickets[0];
    } else {
      return null;
    }
  }

  /**
   * Has a ticket been claimed?
   * @returns {boolean}
   */

  get ticketClaimed() {
    return !!(this.ticket && this.ticket.isUsing);
  }

  /**
   * Has an address been entered?
   * @returns {boolean}
   */

  get haveAddress() {
    const {ticket, vehiclePass} = this;

    // Staff Credentials are Will-Call items and do not require an address
    if (ticket && ticket.isStaffCredential && ticket.isClaimed) {
      return true;
    }

    const item = ticket ?? vehiclePass;
    if (item && item.isClaimed) {
      return item.isDeliveryWillCall || (item.isDeliveryPostal && item.haveAddress);
    }

    // Nothing claimed yet, or not needing address
    return true;
  }
}

