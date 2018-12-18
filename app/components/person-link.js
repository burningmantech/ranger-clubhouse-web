import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

// Component to build a link to the person's page.
@tagName('')
export default class PersonLinkComponent extends Component {
  // use the person record if present. person.id and person.callsign are used.
  @argument person;

  // Otherwise personId and callsign component arguments are used
  @argument personId;
  @argument callsign;
}
