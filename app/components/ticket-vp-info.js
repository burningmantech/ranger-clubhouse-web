// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default class TicketVpInfoComponent extends Component {
  tagName = '';
  ticketingInfo = null;
  ticketPackage = null;
  ticket = null;
  person = null;
  vehiclePass = null;
  setTicketStatus = null;
  toggleCard = null;
  nextSection = null;
  showing = null;

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
