import Component from '@glimmer/component';
import {set} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {action} from '@ember/object';
import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';
import {StateOptions} from 'clubhouse/constants/countries';
import {fadeOut, fadeIn} from 'ember-animated/motions/opacity';
import {tracked, cached} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class TicketDeliverInfoComponent extends Component {
  @tracked deliveryMethod = 'none';
  @tracked isSaved = false;
  @tracked isSaving = false;
  @tracked haveAddress;
  @tracked deliveryForm;

  @service ajax;
  @service toast;
  @service house;

  countryOptions = ['United States', 'Canada'];
  ticketDeliveryValidations = TicketDeliveryValidations;

  stateOptions = StateOptions['US'];

  constructor() {
    super(...arguments);

    const {ticketPackage} = this.args;

    this.haveAddress = !isEmpty(ticketPackage.delivery.street);
    this.delivery = ticketPackage.delivery;
  }

  @cached
  get itemsToMail() {
    const ticket = this.args.ticket;
    const vp = this.args.vehiclePass;
    const items = [];
    const ticketClaimed = (ticket && (ticket.status === 'claimed' || ticket.status === 'submitted'))

    if (ticketClaimed && (ticket.type === 'reduced_price_ticket' || ticket.type === 'gift_ticket')) {
      items.push(ticket);
    }

    if (
      (vp && (vp.status === 'claimed' || vp.status === 'submitted')) &&
      !(ticketClaimed && ticket.type === 'staff_credential')
    ) {
      items.push(vp);
    }

    return items;
  }

  get itemsNeedAddress() {
    const ticket = this.args.ticket;
    const vp = this.args.vehiclePass;
    const items = [];
    const ticketClaimed = (ticket && (ticket.status === 'claimed' || ticket.status === 'submitted'))

    /*
      RPT address is collected directly by BM Ticketing.
      if (ticketClaimed && ticket.type == 'reduced_price_ticket') {
        items.push(ticket);
      }
    */

    if (ticketClaimed && ticket.type === 'gift_ticket') {
      items.push(ticket);
    }

    if (
      (vp && (vp.status === 'claimed' || vp.status === 'submitted')) &&
      !(ticketClaimed && ticket.type === 'staff_credential')
    ) {
      items.push(vp);
    }

    return items;
  }

  get needAnswer() {
    return (this.itemsToMail.length &&
      this.deliveryMethod !== 'mail' &&
      this.deliveryMethod !== 'will_call');
  }

  get usingStaffCredential() {
    const {ticket} = this.args;
    return (ticket && ticket.type === 'staff_credential' && (ticket.status === 'claimed' || ticket.status === 'submitted'));
  }

  @action
  setDeliveryMethod(method) {
    this.deliveryMethod = method;
    this.toast.clear();

    if (method === 'will_call' || !this.itemsNeedAddress.length) {
      this.isSaving = true;
      this.ajax.request(`ticketing/${this.args.person.id}/delivery`, {
        method: 'POST',
        data: {method}
      }).then(() => {
        this.deliveryMethod = method;
        this.toast.success(`Your choice has been recorded.`);
        this.haveAddress = true;
      })
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.isSaving = false);
    } else {
      if (isEmpty(this.delivery.country)) {
        set(this.delivery, 'country', 'United States');
      }

      this.haveAddress = !isEmpty(this.delivery.street);
    }
  }

  @action
  saveDelivery(model, isValid) {
    if (!isValid)
      return;

    this.isSaved = false;
    this.isSaving = true;

    const delivery = this.delivery;

    this.toast.clear();
    this.ajax.request(`ticketing/${this.args.person.id}/delivery`, {
      method: 'POST',
      data: {
        method: 'mail',
        street: model.street,
        city: model.city,
        state: model.state,
        postal_code: model.postal_code,
        //  country: model.get('country'),
        country: 'United States'
      }
    })
      .then(() => {
        model.save(); // push changes back to the original object.
        this.toast.success('The mailing address was successfully saved.');
        set(delivery, 'method', 'mail');
        this.deliveryMethod = 'mail';
        this.isSaved = true;
        this.haveAddress = tue;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSaving = false);
  }

  * transition({insertedSprites, removedSprites}) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
