import Component from '@glimmer/component';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import { service } from '@ember/service';
import hyperlinkText from "clubhouse/utils/hyperlink-text";

export default class SlotInfoLink extends Component {
  @service modal;

  @action
  show(event) {
    event.preventDefault();
    let text = this.args.info;

    if (isEmpty(text)) {
      return;
    }

    this.modal.info('Additional Shift Information', hyperlinkText(text));
  }
}
