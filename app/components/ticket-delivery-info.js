import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

import TicketDeliveryValidations from 'clubhouse/validations/ticket-delivery';

export default class TicketDeliverInfoComponent extends Component {
  @argument('object') ticket;
  @argument('object') person;
  @argument(optional('object')) ticketDelivery;
  @argument('object') saveDelivery;
  @argument('object') ticketingInfo;

  countryOptions = [ 'United States', 'Canada', 'Australia', 'United Kingdom' ];
  ticketDeliveryValidations = TicketDeliveryValidations;

  @computed('ticket.status', 'vpTicket.status')
  get claimed() {
    return (this.ticket && this.ticket.isClaimed) || (this.vpTicket && this.vpTicket.isClaimed);
  }

  @computed('ticket.status')
  get pickupAtWillCall() {
    const ticket = this.ticket;

    return ticket && ticket.isStaffCredential;
  }

  @computed('ticket.status', 'vpTicket.status')
  get ticketComboTitle() {
    const ticket = this.ticket;
    const vpTicket = this.vpTicket;

    let title;
    if ((vpTicket && vpTicket.isClaimed) && (ticket && ticket.isClaimed)) {
      title = 'Staff Credential and Vehicle Pass';
    } else if (vpTicket && vpTicket.isClaimed) {
      title = 'Vehicle Pass';
    } else {
      title = 'Staff Credential';
    }

    return title;
  }

  @computed('ticket', 'vpTicket')
  get goodies() {
    const ticket = this.ticket;
    const vpTicket = this.vpTicket;

    let ticketName = '';

    if (ticket) {
      if (ticket.isReducedPriceTicket) {
        ticketName = 'Reduced-Price Ticket';
      } else if (ticket.isGiftTicket) {
        ticketName = 'Gift Ticket';
      }
    }

    if (ticket && vpTicket) {
      return `${ticket} and Vehicle Pass`;
    } else if (ticket) {
      return ticketName;
    } else {
      return 'Vehicle Pass';
    }
  }

  @computed('ticket', 'vpTicket')
  get goodiesPronoun() {
    return (this.ticket && this.vpTicket) ? 'them' : 'it';
  }

  @computed('ticketDelivery.method')
  get deliveryMethod() {
    const delivery = this.tickeyDelivery;

    return (delivery && delivery.method) ? delivery.method : 'will_call';
  }
}
