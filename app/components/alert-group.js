import Component from '@ember/component';

import { tagName } from '@ember-decorators/component';

@tagName('')
export default class AlertGroupComponent extends Component {
  // Preference list
  group = null;

  // Phone numbers and verification status
  numbers = null;

  // Heading text for group
  heading = null;

  // group description
  description = null;

  // person's email address
  email = null;
}
