import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class HomePastProspectiveDisabledComponent extends Component {
  @argument('object') person;
}
