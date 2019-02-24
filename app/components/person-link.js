import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional, unionOf } from '@ember-decorators/argument/types';
import { computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

// Component to build a link to the person's page.
@tagName('')
export default class PersonLinkComponent extends Component {
  // use the person record if present. person.id and person.callsign are used.
  @argument(optional('object')) person;

  // Otherwise personId and callsign component arguments are used
  @argument(optional('number')) personId;
  @argument(optional('string')) callsign;

  // should a specific
  @argument(optional('string')) page;

  // Year argument?
  @argument(optional(unionOf('string', 'number'))) year;

  @computed('page')
  get routePath() {
    const page = this.page || 'index';

    return `person.${page}`;
  }
}
