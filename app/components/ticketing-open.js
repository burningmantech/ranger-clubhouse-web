import Component from '@ember/component';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';

import { later } from '@ember/runloop';

export default class TicketingOpenComponent extends Component {
  person = null;
  ticketingInfo = null;
  ticketPackage = null;

  showing = { };

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    const person = this.person;

    if (person.isAlpha || person.isProspective) {
      this.set('showing', { wap: true });
    }
  }

  @computed('person.{isAlpha,isProspective,status}')
  get hasFullPackage() {
    return (!this.person.isAlpha && !this.person.isProspective);
  }

  @computed('ticketPackage.tickets')
  get ticket() {
    return this.ticketPackage.tickets.find((ticket) => ticket.selected);
  }

  @computed('ticketPackage.wap')
  get wap() {
    return this.ticketPackage.wap;
  }

  @computed('ticketPackage.vehicle_pass')
  get vehiclePass() {
    return this.ticketPackage.vehicle_pass;
  }

  @action
  setTicketStatus(ticket, status) {
    this.toast.clear();
    this.ajax.request(`access-document/${ticket.id}/status`, {
      method: 'PATCH',
      data: { status }
    }).then(() => {
      set(ticket, 'status', status);
      this.toast.success('Your choice has been successfully saved.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  nextSection(card) {
    this.set('showing', { [card]: true });
    later(() => { this.house.scrollToElement(`#ticket-${card}`); }, 500);

  }

  @action
  toggleCard(card) {
    this.set('showing', { [card]: !this.showing[card] });
  }
}
