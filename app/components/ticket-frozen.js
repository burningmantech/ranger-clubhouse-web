import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class TicketFrozenComponent extends Component {
  @argument('string') item;
  @argument('object') ticketingInfo;
}
