import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';

export default class ChFormCancelComponent extends Component {
   get _label() {
    return isEmpty(this.args.label) ? 'Cancel' : this.args.label;
  }
}
