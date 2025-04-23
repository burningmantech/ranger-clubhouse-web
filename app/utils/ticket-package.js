import {tracked, cached} from '@glimmer/tracking';
import dayjs from 'dayjs';
import {buildMealsLabel, MEALS_FULL_LABELS} from "clubhouse/models/bmid";

export default class TicketPackage {
  @tracked wapso; // WAP-SOs will change in length based on how the user's ticketing decisions.
  @tracked provisionsBanked = false;
  @tracked provisionsBankable = false;

  constructor(pkg, person_id, house) {

    // Build up models for the regular tickets, gift, and LSD.
    const docs = pkg.access_documents.map((ad) => house.pushPayload('access-document', ad));

    this.accessDocuments = docs;
    this.tickets = docs.filter((d) => d.isRegularTicket);
    this.vehiclePasses = docs.filter((d) => d.isVehiclePass);
    this.vehiclePassSP = docs.find((d) => d.isVehiclePassSP);
    this.vehiclePassGift = docs.find((d) => d.isVehiclePassGift);
    this.wap = docs.find((d) => d.isWAP);
    this.wapso = docs.filter((d) => d.isWAPSO);

    const giftItems = pkg.gift_items.map((ad) => house.pushPayload('access-document', ad));
    this.giftTickets = giftItems.filter((i) => i.isGiftTicket);

    const lsdItems = pkg.lsd_items.map((ad) => house.pushPayload('access-document', ad));
    this.lsdTickets = lsdItems.filter((i) => i.isLSDTicket);
    this.lsdVPs = lsdItems.filter((i) => i.isVehiclePassLSD);

    this.provision_records = pkg.provision_records.map((p) => house.pushPayload('provision', p));
    this.provisions = pkg.provisions;
    this.provisionsBankable = pkg.provisions_bankable;
    this.provisionsBanked = pkg.provisions_banked;
    this.provisionItems = [];
    if (pkg.provisions) {
      const stuff = pkg.provisions;
      const {meals} = stuff;
      if (meals && (meals.pre || meals.event || meals.post)) {
        this.provisionItems.push({
          icon: 'utensils',
          name: buildMealsLabel(stuff.meals, MEALS_FULL_LABELS, 'Meal Pass'),
          expires: stuff.meals_expire ? dayjs(stuff.meals_expire).format('YYYY') : '',
        });
      }

      if (stuff.showers) {
        this.provisionItems.push({
          icon: 'shower',
          name: 'Access to The Wet Spot (Org Showers)',
          expires: stuff.showers_expire ? dayjs(stuff.showers_expire).format('YYYY') : '',
        });
      }

      if (stuff.radios) {
        this.provisionItems.push({
          icon: 'broadcast-tower',
          name: stuff.radios === 1 ? 'An Event Radio' : `${stuff.radios} Event Radios`,
          expires: stuff.radio_expire ? dayjs(stuff.radio_expire).format('YYYY') : '',
        });
      }
    }

    this.year_earned = pkg.year_earned;
    this.credits_earned = pkg.credits_earned;

    // The times the end user started and finished ticketing this event.
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

  @cached
  get vehiclePass() {
    if (!this.ticket) {
      return this.vehiclePassGift ?? this.vehiclePassSP;
    }

    return this.ticket.isStaffCredential ? this.vehiclePassGift : this.vehiclePassSP;
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

  /**
   * Does the person have an earned event radio, and none allocated?
   *
   * @returns {boolean}
   */

  get haveEventRadio() {
    return !!(
      !this.provision_records.find((p) => p.isEventRadio && p.is_allocated)
      && this.provision_records.find((p) => p.isEventRadio && p.isAvailable && !p.is_allocated));
  }
}

