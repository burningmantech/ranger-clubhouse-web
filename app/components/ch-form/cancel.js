import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';

@tagName('')
export default class ChFormCancelComponent extends Component {
  label = null;
  cancelClass = null;
  disabled = null;
  cancelAction = null;

  @computed('label')
  get _label() {
    return isEmpty(this.label) ? 'Cancel' : this.label;
  }
}
