import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import { ticketTypeHuman as ticketTypeFormat} from 'clubhouse/helpers/ticket-type-human';

@tagName('')
export default class TicketInfoComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;
  @argument(optional('object')) ticket;
  @argument('object') setTicketStatus;
  @argument('object') showing;
  @argument('object') toggleCard;
  @argument('object') nextSection;

  @computed('ticket.type')
  get ticketTypeHuman() {
    return ticketTypeFormat([ this.ticket.type ]);
  }
}
