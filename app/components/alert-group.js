import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class AlertGroupComponent extends Component {
  // Preference list
  @argument('object') group;

  // Phone numbers and verification status
  @argument('object') numbers;

  // Heading text for group
  @argument('string') heading;

  // group description
  @argument('string') description;

  // person's email address
  @argument('string') email;
}
