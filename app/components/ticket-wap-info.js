// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

@classic
export default class TicketWapInfoComponent extends Component {
  tagName = '';

  ticketingInfo = null;
  ticketPackage = null;
  person = null;
  ticket = null;
  wap = null;
  setTicketStatus = null;
  toggleCard = null;
  nextSection = null;
  showing = null;

  @computed('ticket.{type,status}')
  get isStaffCredentialBanked() {
    const ticket = this.ticket;

    return (ticket && ticket.type === 'staff_credential' && ticket.status === 'banked');
  }

  @computed('ticket.{type,status}')
  get usingStaffCredential() {
    const ticket = this.ticket;

    return (ticket && ticket.type === 'staff_credential' && (ticket.status === 'claimed' || ticket.status === 'submitted'));
  }

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
