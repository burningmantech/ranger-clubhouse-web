import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';

export default class ChFormCancelComponent extends Component {
  tagName = '';

  label = null;
  cancelClass = null;
  disabled = null;
  cancelAction = null;

  @computed('label')
  get _label() {
    return isEmpty(this.label) ? 'Cancel' : this.label;
  }
}
