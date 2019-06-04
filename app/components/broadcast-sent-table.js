import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class BroadcastSentTableComponent extends Component {
  @argument('object') result;
}
