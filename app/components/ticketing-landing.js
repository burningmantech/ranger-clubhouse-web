import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class TicketingLandingComponent extends Component {
  @argument('object') ticketingInfo;
  @argument('object') ticketPackage;
  @argument('object') person;
}
