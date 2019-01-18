import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class TrainingSidebarComponent extends Component {
  @argument('object') training;
}
