import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class TicketCardComponent extends Component {
  @argument('object') ticket;
}
