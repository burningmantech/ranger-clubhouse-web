import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class SlotInfoLink extends Component {
  static  positionalParams =  [ 'description', 'info' ];

  @argument description;
  @argument info;

  @action
  show() {
    let text = this.info;
    if (!text) {
      return;
    }
    text = text.replace(/\b(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    text = text.replace(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, '<a href="mailto:$1">$1</a>');
    this.modal.info('Shift Additional Information', text);
  }
}
