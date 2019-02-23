import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class TicketingAnnounceComponent extends Component {
  @argument('object') person;
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
}
