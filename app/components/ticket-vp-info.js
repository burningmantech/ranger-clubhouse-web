import Component from '@ember/component';


import { tagName } from '@ember-decorators/component';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

@tagName('')
export default class TicketVpInfoComponent extends Component {
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
