import Component from '@ember/component';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';

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

  countryOptions = [ 'United States', 'Canada' ];
  ticketDeliveryValidations = TicketDeliveryValidations;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set('deliveryMethod', this.ticketPackage.delivery.method);
  }

  @computed('ticket.status', 'vehiclePass.status')
  get mailables() {
    const ticket = this.ticket;
    const vp = this.vehiclePass;
    const items = [];
    const ticketClaimed = (ticket && (ticket.status == 'claimed' || ticket.status == 'submitted'))

    if (ticketClaimed && ticket.type == 'reduced_price_ticket') {
      items.push(ticket);
    }

    if ((vp && (vp.status == 'claimed' || vp.status == 'submitted'))
    && (ticketClaimed && ticket.type != 'staff_credential')) {
      items.push(vp);
    }

    return items;
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

    if (method == 'will_call') {
      this.ajax.request(`ticketing/${this.person.id}/delivery`, {
        method: 'POST',
        data: { method }
      }).then(() => {
        this.set('deliveryMethod', method);
        this.toast.success('Your choice has been recorded. The item(s) will be picked up at Will Call.');
      })
      .catch((response) => this.house.handleErrorResponse(response));
    } else {
      if (isEmpty(this.delivery.country)) {
        set(this.delivery, 'country', 'United States');
      }
    }
  }

  @action
  saveDelivery(model, isValid) {
    if (!isValid)
      return;

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
        country: model.get('country'),
      }
    })
    .then(() => {
      model.execute();  // push changes back to the original object.
      this.toast.success('The mailing address was successfully saved.');
      set(delivery, 'method', 'mail');
      this.set('deliveryMethod', 'mail');
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
