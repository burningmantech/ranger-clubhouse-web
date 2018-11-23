import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class PersonLinkComponent extends Component {
  @argument person;
  @argument personId;
  @argument callsign;
}
