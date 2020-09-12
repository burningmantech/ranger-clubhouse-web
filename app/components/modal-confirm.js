import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';

export default class ModalConfirmComponent extends Component {
  get htmlMessage() {
    return htmlSafe(this.args.dialog.message);
  }
}
