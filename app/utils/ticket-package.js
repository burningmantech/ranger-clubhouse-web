import {tracked, cached} from '@glimmer/tracking';
import {MealMatrixLabel} from 'clubhouse/models/provision';
import dayjs from 'dayjs';

export default class TicketPackage {
  @tracked wapso; // WAP-SOs will change in length based on how the user's ticketing decisions.
  @tracked provisionsBanked = false;
  @tracked provisionsBankable = false;

  constructor(pkg, person_id, house) {
    const docs = pkg.access_documents.map((ad) => house.pushPayload('access-document', ad));

    this.accessDocuments = docs;
    this.tickets = docs.filter((d) => d.isTicket);
    this.vehiclePass = docs.find((d) => d.isVehiclePass);
    this.wap = docs.find((d) => d.isWAP);
    this.wapso = docs.filter((d) => d.isWAPSO);

    this.provisions = pkg.provisions;
    this.provisionsBankable = pkg.provisions_bankable;
    this.provisionsBanked = pkg.provisions_banked;
    this.provisionItems = [];
    if (pkg.provisions) {
      const stuff = pkg.provisions;
      if (stuff.meals) {
        this.provisionItems.push({
          icon: 'utensils',
          name: `${MealMatrixLabel[stuff.meals]} Meal Pass`,
          expires: dayjs(stuff.meals_expire).format('YYYY-MM-DD'),
        });
      }
      if (stuff.showers) {
        this.provisionItems.push({
          icon: 'shower',
          name: 'Access to The Wet Spot (Org Showers)',
          expires: dayjs(stuff.showers_expire).format('YYYY-MM-DD'),
        });
      }

      if (stuff.radios) {
        this.provisionItems.push({
          icon: 'broadcast-tower',
          name: stuff.radios === 1 ? 'An Event Radio' : `${stuff.radios} Event Radios`,
          expires: dayjs(stuff.radio_expire).format('YYYY-MM-DD'),
        });
      }
    }

    this.year_earned = pkg.year_earned;
    this.credits_earned = pkg.credits_earned;
    this.started_at = pkg.started_at;
    this.finished_at = pkg.finished_at;
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

