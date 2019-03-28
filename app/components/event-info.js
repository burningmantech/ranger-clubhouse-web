import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class EventInfoComponent extends Component {
  @argument('object') person;
  @argument('object') eventInfo;
}
