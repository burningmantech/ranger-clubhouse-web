import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

// Component to build a link to the person's page.
@tagName('')
export default class PersonLinkComponent extends Component {
  // use the person record if present. person.id and person.callsign are used.
  @argument person;

  // Otherwise personId and callsign component arguments are used
  @argument personId;
  @argument callsign;

  // should a specific
  @argument page;

  // Year argument?
  @argument year;

  @computed('page')
  get routePath() {
    const page = this.page || 'index';

    return `person.${page}`;
  }
}
