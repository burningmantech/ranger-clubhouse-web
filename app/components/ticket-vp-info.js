import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class TicketVpInfoComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument(optional('object')) ticket;
  @argument('object') person;
  @argument(optional('object')) vehiclePass;
  @argument('object') setTicketStatus;
  @argument('object') toggleCard;
  @argument('object') nextSection;
  @argument('object') showing;
}
