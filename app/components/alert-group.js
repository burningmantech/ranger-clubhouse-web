import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class AlertGroupComponent extends Component {
  @argument group;
  @argument heading;
  @argument person;
  @argument description;
}
