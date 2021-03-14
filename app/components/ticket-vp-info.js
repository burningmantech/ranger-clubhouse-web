import Component from '@glimmer/component';

export default class TicketVpInfoComponent extends Component {
  constructor() {
    super(...arguments);
    this.vehiclePass = this.args.ticketPackage.vehiclePass;
  }
}
