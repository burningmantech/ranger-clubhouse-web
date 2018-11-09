import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class AlertGroupComponent extends Component {
  // Preference list
  @argument group;

  // Phone numbers and verification status
  @argument numbers;

  // Heading text for group
  @argument heading;

  // group description
  @argument description;

  // person's email address 
  @argument email;
}
