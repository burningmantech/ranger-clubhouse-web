import Component from '@glimmer/component';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

export default class TicketVpInfoComponent extends Component {

  * transition({ insertedSprites, removedSprites }) { // eslint-disable-line require-yield
    insertedSprites.forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  }
}
