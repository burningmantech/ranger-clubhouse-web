import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';


import { isEmpty } from '@ember/utils';

@tagName('')
export default class ChFormResetButtonComponent extends Component {
  resetAction = null;
  label = null;
  disabled = null;

  init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.label = 'Reset';
    }
  }
}
