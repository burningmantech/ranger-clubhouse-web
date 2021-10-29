import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ModalInfoComponent extends Component {
  get htmlMessage() {
    return htmlSafe(this.args.dialog.message);
  }
}
