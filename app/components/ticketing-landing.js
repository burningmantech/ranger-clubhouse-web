import Component from '@glimmer/component';
import TicketPackage from 'clubhouse/utils/ticket-package';
import {service} from '@ember/service';
import {action} from '@ember/object';
import TicketingAnnounce from 'clubhouse/components/ticketing-announce';
import TicketingOpen from 'clubhouse/components/ticketing-open';
import TicketingClosed from 'clubhouse/components/ticketing-closed';
import TicketingOffseason from 'clubhouse/components/ticketing-offseason';

const TicketingPeriodComponents = {
  announce: TicketingAnnounce,
  open: TicketingOpen,
  closed: TicketingClosed,
  offseason: TicketingOffseason
};

export default class TicketingLandingComponent extends Component {
  @service house;

  constructor() {
    super(...arguments);
    const {person,ticketingInfo} = this.args;
    this.ticketPackage = new TicketPackage(this.args.ticketingPackage, this.args.person.id, this.house);
    this.ticketComponent = TicketingPeriodComponents[ticketingInfo.period];
    this.showFaqs = !person.isPNV || (ticketingInfo.period !== 'announce');
  }

  @action
  scrollToFAQs() {
    this.house.scrollToElement('#ticketing-faq');
  }
}
