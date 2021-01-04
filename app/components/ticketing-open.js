import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { set } from '@ember/object';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';

class TicketItem {
  @tracked status;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

class AccessPackage {
  @tracked ticket;
  @tracked wap;
  @tracked vehiclePass;

  constructor(pkg) {
    const ticket = pkg.tickets.find((ticket) => ticket.selected);
    if (ticket) {
      this.ticket = new TicketItem(ticket);
    }
    if (pkg.wap) {
      this.wap = new TicketItem(pkg.wap);
    }
    if (pkg.vehicle_pass) {
      this.vehiclePass = new TicketItem(pkg.vehicle_pass);
    }
  }
}

// TODO: Remove ticket, vp, and wap component arguments and use this.accessPackage.

export default class TicketingOpenComponent extends Component {
  @tracked showing = { };
  @tracked hasFullPackage = false;
  @tracked isPNV = false;
  @tracked accessPackage;

  @service ajax;
  @service house;
  @service store;
  @service toast;


  constructor() {
    super(...arguments);
    const {person, ticketPackage} = this.args;

    if (person.isAlpha || person.isProspective) {
      this.showing = { wap: true};
      this.isPNV = true;
    } else {
      this.hasFullPackage = true;
    }

    this.accessPackage = new AccessPackage(ticketPackage);
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
    this.showing = { [card]: true };
    later(() => { this.house.scrollToElement(`#ticket-${card}`); }, 500);
  }

  @action
  toggleCard(card) {
    this.showing =  { [card]: !this.showing[card] };
  }
}
