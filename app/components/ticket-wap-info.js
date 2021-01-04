import Component from '@glimmer/component';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default class TicketWapInfoComponent extends Component {
  get isStaffCredentialBanked() {
    const {ticket} = this.args;

    return (ticket && ticket.type === 'staff_credential' && ticket.status === 'banked');
  }

  get usingStaffCredential() {
    const {ticket} = this.args;

    return (ticket && ticket.type === 'staff_credential' && (ticket.status === 'claimed' || ticket.status === 'submitted'));
  }

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
