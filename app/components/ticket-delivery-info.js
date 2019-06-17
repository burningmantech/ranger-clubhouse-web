import Component from '@ember/component';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';
import { StateOptions } from 'clubhouse/constants/countries';

@tagName('')
export default class TicketDeliverInfoComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;
  @argument(optional('object')) ticket;
  @argument(optional('object')) vehiclePass;
  @argument('object') showing;
  @argument('object') toggleCard;

  deliveryMethod = 'none';
  isSaved = false;

  countryOptions = ['United States', 'Canada'];
  ticketDeliveryValidations = TicketDeliveryValidations;

  stateOptions = StateOptions['US'];

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set('deliveryMethod', this.ticketPackage.delivery.method);
    this.set('haveAddress', !isEmpty(this.ticketPackage.delivery.street));
  }

  @computed('ticket.status', 'vehiclePass.status')
  get itemsToMail() {
    const ticket = this.ticket;
    const vp = this.vehiclePass;
    const items = [];
    const ticketClaimed = (ticket && (ticket.status == 'claimed' || ticket.status == 'submitted'))

    if (ticketClaimed && (ticket.type == 'reduced_price_ticket' || ticket.type == 'gift_ticket')) {
      items.push(ticket);
    }

    if (
      (vp && (vp.status == 'claimed' || vp.status == 'submitted')) &&
      !(ticketClaimed && ticket.type == 'staff_credential')
    ) {
      items.push(vp);
    }

    return items;
  }

  @computed('ticket.status', 'vehiclePass.status')
  get itemsNeedAddress() {
    const ticket = this.ticket;
    const vp = this.vehiclePass;
    const items = [];
    const ticketClaimed = (ticket && (ticket.status == 'claimed' || ticket.status == 'submitted'))

    /*
      RPT address is collected directly by BM Ticketing.
      if (ticketClaimed && ticket.type == 'reduced_price_ticket') {
        items.push(ticket);
      }
    */

    if (ticketClaimed && ticket.type == 'gift_ticket') {
      items.push(ticket);
    }

    if (
      (vp && (vp.status == 'claimed' || vp.status == 'submitted')) &&
      !(ticketClaimed && ticket.type == 'staff_credential')
    ) {
      items.push(vp);
    }

    return items;
  }

  @computed('itemsToMail', 'usingStaffCredential')
  get needAnswer() {
    return (this.itemsToMail.length &&
      this.deliveryMethod != 'mail' &&
      this.deliveryMethod != 'will_call');
  }

  @computed('ticketPackage.delivery')
  get delivery() {
    return this.ticketPackage.delivery;
  }

  @computed('ticket.{status,type}')
  get usingStaffCredential() {
    const ticket = this.ticket;
    return (ticket && ticket.type == 'staff_credential' && (ticket.status == 'claimed' || ticket.status == 'submitted'));
  }

  @action
  setDeliveryMethod(method) {
    this.set('deliveryMethod', method);
    this.toast.clear();

    if (method == 'will_call' || !this.itemsNeedAddress.length) {
      this.ajax.request(`ticketing/${this.person.id}/delivery`, {
          method: 'POST',
          data: { method }
        }).then(() => {
          this.set('deliveryMethod', method);
          this.toast.success(`Your choice has been recorded.`);
          this.set('haveAddress', true);
        })
        .catch((response) => this.house.handleErrorResponse(response));
    } else {
      if (isEmpty(this.delivery.country)) {
        set(this.delivery, 'country', 'United States');
      }

      this.set('haveAddress', !isEmpty(this.delivery.street));
    }
  }

  @action
  saveDelivery(model, isValid) {
    if (!isValid)
      return;

    this.set('isSaved', false);
    const delivery = this.delivery;

    this.toast.clear();
    this.ajax.request(`ticketing/${this.person.id}/delivery`, {
        method: 'POST',
        data: {
          method: 'mail',
          street: model.get('street'),
          city: model.get('city'),
          state: model.get('state'),
          postal_code: model.get('postal_code'),
          //  country: model.get('country'),
          country: 'United States'
        }
      })
      .then(() => {
        model.save(); // push changes back to the original object.
        this.toast.success('The mailing address was successfully saved.');
        set(delivery, 'method', 'mail');
        this.set('deliveryMethod', 'mail');
        this.set('isSaved', true);
        this.set('haveAddress', true);
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
