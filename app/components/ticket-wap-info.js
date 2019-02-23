import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { unionOf } from '@ember-decorators/argument/types';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class TicketWapInfoComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;
  @argument(optional('object')) ticket;
  @argument(optional('object')) wap;
  @argument('object') setTicketStatus;
  @argument('object') toggleCard;
  @argument(unionOf('boolean', 'object')) nextSection;
  @argument('object') showing;

  @computed('ticket.{type,status}')
  get isStaffCredentialBanked() {
    const ticket = this.ticket;

    return (ticket && ticket.type == 'staff_credential' && ticket.status == 'banked');
  }

  @computed('ticket.{type,status}')
  get usingStaffCredential() {
    const ticket = this.ticket;

    return (ticket && ticket.type == 'staff_credential' && (ticket.status == 'claimed' || ticket.status == 'submitted'));
  }
}
