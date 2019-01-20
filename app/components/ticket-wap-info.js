import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

export default class TicketWapInfoComponent extends Component {
  @argument(optional('object')) ticket;
  @argument(optional('object')) wapTicket;
  @argument('string') ticketingStatus;
  @argument('object') saveChoice;
  @argument('object') ticketingInfo;

  wapAction = '';

  @computed('ticket.{status,type}')
  get isNotBankedStaffCredential() {
      const ticket = this.ticket;
      return (ticket && ticket.isStaffCredential && !ticket.isBanked);
  }

  @computed('ticket.{status,type}')
  get isBankedStaffCredential() {
      const ticket = this.ticket;
      return (ticket && ticket.isStaffCredential && ticket.isBanked);
  }

  @computed('wapTicket.status')
  get congratSentence() {
    const ticket = this.wapTicket;
    let verb, trailing = '';

    if (ticket.isClaimed) {
      verb = "you've claimed your";
    } else if (ticket.isSubmitted) {
      verb = "we have submitted your";
      trailing = " to the Burning Man Ticket Request System";
    } else {
      verb = "you've qualified for a";
    }

    return `${verb} ${ticket.typeHuman}${trailing}`;
  }
}
