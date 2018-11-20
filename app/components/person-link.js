import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class PersonLinkComponent extends Component {
  @argument person;
  @argument personId;
  @argument callsign;
}
