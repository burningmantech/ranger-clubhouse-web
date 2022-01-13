import Component from '@glimmer/component';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import { service } from '@ember/service';

export default class SlotInfoLink extends Component {
  @service modal;

  @action
  show(event) {
    event.preventDefault();
    let text = this.args.info;

    if (isEmpty(text)) {
      return;
    }

    text = text.replace(/\b(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    text = text.replace(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, '<a href="mailto:$1">$1</a>');
    this.modal.info('Shift Additional Information', text);
  }
}
