import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';

export default class ChFormResetButtonComponent extends Component {
  tagName = '';
  resetAction = null;
  label = null;
  disabled = null;

  @computed('label')
  get _label() {
    return isEmpty(this.label) ? 'Reset' : this.label;
  }
}
