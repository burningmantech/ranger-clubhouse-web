import Component from '@glimmer/component';
import {action} from '@ember/object';
import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';
import {StateOptions} from 'clubhouse/constants/countries';
import {tracked, cached} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {DELIVERY_MAIL, DELIVERY_WILL_CALL} from 'clubhouse/models/access-document-delivery';

export default class TicketDeliverInfoComponent extends Component {
  @tracked currentDeliveryMethod;
  @tracked isSaved = false;

  @service ajax;
  @service house;
  @service store;
  @service toast;

  countryOptions = ['United States', 'Canada'];
  stateOptions = StateOptions['US'];

  ticketDeliveryValidations = TicketDeliveryValidations;

  constructor() {
    super(...arguments);

    this.vehiclePass = this.args.ticketPackage.vehiclePass;
    this.delivery = this.args.ticketPackage.delivery;

    this.currentDeliveryMethod =  this.delivery.method;
  }

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

  get haveAddress() {
    return this.args.ticketPackage.haveAddress;
  }

  /**
   * Find all the items which need to be mailed (RPT, Vehicle Pass, Gift Ticket).
   *
   * @returns {AccessDocumentModel[]}
   */

  @cached
  get itemsToDeliver() {
    const {ticket} = this.args;
    const {vehiclePass} = this;
    const items = [];
    const ticketClaimed = this.ticketClaimed;

    if (ticketClaimed && (ticket.isReducedPriceTicket || ticket.isGiftTicket)) {
      items.push(ticket);
    }

    if ((vehiclePass && vehiclePass.isUsing) && !(ticketClaimed && ticket.isStaffCredential)) {
      items.push(vehiclePass);
    }

    return items;
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

  /**
   * Count how many unclaimed appreciations are there
   *
   * @returns {number}
   */

  get unclaimedAppreciationsCount() {
    return this.args.ticketPackage.appreciations.filter((a) => (a.isQualified && !a.isEventRadio)).length;
  }

  /**
   * Is the delivery method postal?
   *
   * @returns {boolean}
   */
  get isDeliveryMail() {
    return this.delivery.isDeliveryMail;
  }

  /**
   * Is the delivery pickup from Will Call?
   * @returns {boolean}
   */

  get isDeliveryWillCall() {
    return this.delivery.isDeliveryWillCall;
  }

  /**
   * Has no delivery method been selected or is not applicable?
   *
   * @returns {boolean}
   */

  get isDeliveryNone() {
    return this.delivery.isDeliveryNone;
  }

  /**
   * Find all the items needing an address.
   *
   * @returns {AccessDocumentModel[]|[]}
   */

  @cached
  get itemsNeedAddress() {
    const {ticket} = this.args;
    const {vehiclePass} = this;
    const items = [];
    const ticketClaimed = this.ticketClaimed;

    /*
      For 2019 RPT address is collected directly by BM Ticketing.
      if (ticketClaimed && ticket.type == 'reduced_price_ticket') {
        items.push(ticket);
      }
    */

    if (ticketClaimed && ticket.isReducedPriceTicket) {
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
   * Does the user need to given an answer on how an item(s) is to be delivered,
   * and/or does an address need to be collected? Only intended to be used in
   * the section title.
   *
   * @returns {boolean}
   */

  get needAnswer() {
    if (this.unclaimedAppreciationsCount) {
      return true;
    }

    if (!this.itemsToDeliver.length) {
      return false;
    }

    switch (this.currentDeliveryMethod) {
      case DELIVERY_WILL_CALL:
        return false;
      case DELIVERY_MAIL:
        return !this.delivery.haveAddress;
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
    this.delivery.method = method;
    if (method === DELIVERY_WILL_CALL) {
      this.delivery.save()
        .then(() => {
          this.currentDeliveryMethod = DELIVERY_WILL_CALL;
          this.toast.success(`Your choice has been recorded.`);
        })
        .catch((response) => {
          this.delivery.rollbackAttributes();
          this.house.handleErrorResponse(response);
        });
    }
  }

  @action
  saveDeliveryAddress(model, isValid) {
    if (!isValid)
      return;

    this.isSaved = false;

    model.method = DELIVERY_MAIL;
    model.save().then(() => {
        this.toast.success('The mailing address was successfully saved.');
        this.isSaved = true;
        this.currentDeliveryMethod = DELIVERY_MAIL;
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
