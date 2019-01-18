import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';

/*
 * Component helper to truncate text with a 'read more' link.
 */

@tagName('')
export default class ReadMoreComponent extends Component {
  @argument('string') text;
  @argument(optional('number')) limit = 20;

  hideFullText = true;

  @computed('text')
  get truncatedText() {
    return this.text.substr(0, this.limit);
 }

  @computed('text')
  get shouldTruncate() {
    return this.text && (this.text.length > this.limit);
  }

  @action
  readMoreAction() {
    this.set('hideFullText', false);
  }
}
