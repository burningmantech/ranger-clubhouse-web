import Component from '@glimmer/component';
import { ticketTypeLabel } from 'clubhouse/constants/ticket-types';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default class TicketInfoComponent extends Component {
  get ticketType() {
    const type = this.args.ticket.type;
    return ticketTypeLabel[type] || `Unknown ticket type [${type}]`;
  }

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }

}
