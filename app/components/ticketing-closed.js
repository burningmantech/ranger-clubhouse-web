import Component from '@glimmer/component';

export default class TicketingClosedComponent extends Component {
   get ticket() {
    return this.args.ticketPackage.tickets.find((ticket) => ticket.selected);
  }

  get delivery() {
    return this.args.ticketPackage.delivery;
  }

  get wap() {
    return this.args.ticketPackage.wap;
  }

  get usingStaffCredential() {
    const ticket = this.ticket;
    return (ticket && ticket.type == 'staff_credential' && (ticket.status == 'claimed' || ticket.status == 'submitted'));
  }

  get usingRPT() {
    const ticket = this.ticket;
    return (ticket && ticket.type == 'reduced_price_ticket' && (ticket.status == 'claimed' || ticket.status == 'submitted'));
  }

  get usingVehiclePass() {
    const pass = this.args.ticketPackage.vehicle_pass;
    return (pass && (pass.status == 'claimed' || pass.status == 'submitted'));
  }

  get haveVP() {
    const pass = this.args.ticketPackage.vehicle_pass;
    return (pass && (pass.status == 'qualified' || pass.status == 'claimed' || pass.status == 'submitted'));
  }

  get usingWAP() {
    const wap = this.args.ticketPackage.wap;
    return (wap && (wap.status == 'claimed' || wap.status == 'submitted'));
  }

  get hasFullPackage() {
     const person = this.args.person;
    return (!person.isAlpha && !person.isProspective);
  }

  get usingMail() {
    const delivery = this.args.ticketPackage.delivery;

    return (delivery && delivery.method == 'mail');
  }

  get usingWillCall() {
    const delivery = this.args.ticketPackage.delivery;
    return (!delivery || delivery.method != 'mail');
  }

  // Return a list of WAP SO names
  get wapSOList() {
    return this.args.ticketPackage.wapso;
  }
}
