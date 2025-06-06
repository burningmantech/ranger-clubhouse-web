import Component from '@glimmer/component';
import {action} from '@ember/object';
import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';
//import {StateOptions} from 'clubhouse/constants/countries';
import {tracked, cached} from '@glimmer/tracking';
import {service} from '@ember/service';
import {DELIVERY_POSTAL, DELIVERY_PRIORITY, DELIVERY_WILL_CALL} from 'clubhouse/models/access-document';

export default class TicketDeliverInfoComponent extends Component {
  @tracked isSaved = false;
  @tracked isSaving = false;

  @service ajax;
  @service house;
  @service store;
  @service toast;

  // stateOptions = StateOptions['US'];

  ticketDeliveryValidations = TicketDeliveryValidations;

  constructor() {
    super(...arguments);

    this.vehiclePass = this.args.ticketPackage.vehiclePass;
  }

  /*
  @cached
  get delivery() {
    const item = this.itemToDeliver;
    if (item) {
      return {
        street1: item.street1,
        street2: item.street2,
        city: item.city,
        state: item.state,
        postal_code: item.postal_code,
        country: item.country,
      }
    } else {
      return {county: 'US'};
    }
  }
  */

  /**
   * Are there any unclaimed tickets?
   *
   * @returns {boolean}
   */

  get hasQualifiedTickets() {
    return !!this.args.ticketPackage.tickets.find((t) => t.isQualified);
  }

  /**
   * Has the address been entered?
   *
   * @returns {boolean}
   */

  /*
  get haveAddress() {
    return this.args.ticketPackage.haveAddress;
  }*/

  /**
   * Find all the items which need to be mailed (SPT, Vehicle Pass, Gift Ticket).
   *
   * @returns {AccessDocumentModel[]}
   */

  @cached
  get itemsToDeliver() {
    const {ticket} = this.args;
    const {vehiclePass} = this;
    const items = [];
    const ticketClaimed = this.ticketClaimed;

    if (ticketClaimed && ticket.isSpecialPriceTicket) {
      items.push(ticket);
    }

    if ((vehiclePass && vehiclePass.isUsing) && !(ticketClaimed && ticket.isStaffCredential)) {
      items.push(vehiclePass);
    }

    return items;
  }

  @cached
  get namesToDeliver() {
    return this.itemsToDeliver.map((i) => i.typeLabel).join(' + ');
  }

  /**
   * Has a ticket been claimed or banked?
   *
   * @returns {boolean}
   */

  get ticketClaimed() {
    const {ticket} = this.args;
    return !!(ticket && ticket.isUsing);
  }

  get itemToDeliver() {
    const {ticket} = this.args;
    const {vehiclePass} = this;

    const item = ticket ?? vehiclePass;

    return item?.isUsing ? item : null;
  }


  /**
   * Is the delivery method postal?
   *
   * @returns {boolean}
   */

  get isDeliveryStandardPost() {
    return this.itemToDeliver && this.itemToDeliver.isDeliveryStandardPost;
  }

  get isDeliveryPriorityPost() {
    return this.itemToDeliver && this.itemToDeliver.isDeliveryPriorityPost;
  }

  /**
   * Is the delivery pickup from Will Call?
   * @returns {boolean}
   */

  get isDeliveryWillCall() {
    return this.itemToDeliver && this.itemToDeliver.isDeliveryWillCall;
  }

  /**
   * Has no delivery method been selected or is not applicable?
   *
   * @returns {boolean}
   */

  get isDeliveryNone() {
    return this.itemToDeliver?.isDeliveryNone;
  }

  /**
   * Find all the items needing an address.
   *
   * @returns {AccessDocumentModel[]}
   */

  @cached
  get itemsNeedAddress() {
    const {ticket} = this.args;
    const {vehiclePass} = this;
    const items = [];
    const ticketClaimed = this.ticketClaimed;

    /*
      For 2022 SPT address is collected directly by BM Ticketing.
      if (ticketClaimed && ticket.type == 'special_price_ticket') {
        items.push(ticket);
      }
    */

    if (ticketClaimed && ticket.isSpecialPriceTicket) {
      items.push(ticket);
    }

    if (
      (vehiclePass && vehiclePass.isUsing) &&
      !(ticketClaimed && ticket.isStaffCredential)
    ) {
      items.push(vehiclePass);
    }

    return items;
  }


  /**
   * Does the user need to give an answer on how an item(s) is to be delivered,
   * and/or does an address need to be collected? Only intended to be used in
   * the section title.
   *
   * @returns {boolean}
   */

  get needAnswer() {
    const item = this.itemToDeliver;

    if (!item) {
      return false;
    }

    switch (item.delivery_method) {
      case DELIVERY_POSTAL:
      case DELIVERY_PRIORITY:
      case DELIVERY_WILL_CALL:
        return false;
      default:
        return true;
    }
  }

  /**
   * Is a Staff Credential being used?
   *
   * @returns {boolean}
   */

  get usingStaffCredential() {
    const {ticket} = this.args;
    return !!(ticket && ticket.isStaffCredential && ticket.isUsing);
  }

  /**
   * Set the delivery method (will_call or mail) for an item.
   * The ticketing delivery api update all qualified and unclaimed items requiring a delivery method based
   *
   * @param {string} method
   */

  @action
  setDeliveryMethod(method) {
    this._saveDeliveryCommon({delivery_method: method}, 'Delivery choice successfully saved.');
  }

  async _saveDeliveryCommon(data, message) {
    this.isSaving = true;

    try {
      const {access_document} = await this.ajax.post(`ticketing/${this.args.person.id}/delivery`, {data})
      this.house.pushPayload('access-document', access_document);
      this.toast.success(message);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSaving = false;
    }
  }
}
