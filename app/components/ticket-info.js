import Component from '@ember/component';
import { computed } from '@ember/object';


import { tagName } from '@ember-decorators/component';
import { ticketTypeLabel } from 'clubhouse/constants/ticket-types';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

@tagName('')
export default class TicketInfoComponent extends Component {
  ticketingInfo = null;
  ticketPackage = null;
  person = null;
  ticket = null;
  setTicketStatus = null;
  showing = null;
  toggleCard = null;
  nextSection = null;

  @computed('ticket.type')
  get ticketType() {
    return ticketTypeLabel[this.ticket.type] || `Unknown ticket type [${this.ticket.type}]`;
  }

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }

}
