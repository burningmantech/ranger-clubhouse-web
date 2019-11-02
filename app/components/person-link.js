import Component from '@ember/component';
import { computed } from '@ember/object';
import { tagName } from '@ember-decorators/component';

// Component to build a link to the person's page.
@tagName('')
export default class PersonLinkComponent extends Component {
  // use the person record if present. person.id and person.callsign are used.
  person = null;

  // Otherwise personId and callsign component arguments are used
  personId = null;
  callsign = null;

  // should a specific
  page = null;

  // Year argument?
  year = null;

  @computed('page')
  get routePath() {
    const page = this.page || 'index';

    return `person.${page}`;
  }
}
