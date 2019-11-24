import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';

@tagName('')
export default class ChFormResetButtonComponent extends Component {
  resetAction = null;
  label = null;
  disabled = null;

  @computed('label')
  get _label() {
    return isEmpty(this.label) ? 'Reset' : this.label;
  }
}
