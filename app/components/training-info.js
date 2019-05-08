import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class TrainingInfoComponent extends Component {
  @argument('object') trainings;
}
