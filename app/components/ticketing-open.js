import Component from '@ember/component';
import { set } from '@ember/object';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class TicketingOpenComponent extends Component {
  @argument('object') person;
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;

  showing = { };

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    const person = this.person;

    if (person.isAlpha || person.isProspective) {
      this.set('showing', { wap: true });
    }
  }

  @computed('person.status')
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
    this.house.scrollToElement(`#ticket-${card}`);
  }

  @action
  toggleCard(card) {
    this.set('showing', { [card]: !this.showing[card] });
  }
}
