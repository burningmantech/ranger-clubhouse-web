import Component from '@glimmer/component';
import TicketPackage from 'clubhouse/utils/ticket-package';
import { service } from '@ember/service';

export default class TicketingLandingComponent extends Component {
  @service house;

  constructor() {
    super(...arguments);
    this.ticketPackage = new TicketPackage(this.args.ticketingPackage, this.args.person.id, this.house);
  }
}
