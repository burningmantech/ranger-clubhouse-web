import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import { isEmpty } from '@ember/utils';

@tagName('')
export default class SlotInfoLink extends Component {
  static  positionalParams =  [ 'description', 'info' ];

  @argument(optional('string')) description;
  @argument(optional('string')) info;

  @action
  show() {
    let text = this.info;

    if (isEmpty(text)) {
      return;
    }

    text = text.replace(/\b(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    text = text.replace(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, '<a href="mailto:$1">$1</a>');
    this.modal.info('Shift Additional Information', text);
  }
}
