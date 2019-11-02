import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { tagName } from '@ember-decorators/component';



@tagName('')
export default class ChFormCancelComponent extends Component {
  label = null;
  cancelClass = null;
  disabled = null;
  cancelAction = null;

  init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.set('label', 'Cancel');
    }
  }

  didRender() {
    if (isEmpty(this.label)) {
      this.set('label', 'Cancel');
    }
  }
}
