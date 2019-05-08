import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ShiftLeadTableComponent extends Component {
  @argument('string') title;
  @argument('object') people;

}
