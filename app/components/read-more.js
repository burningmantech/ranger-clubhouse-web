import Component from '@ember/component';
import { action, computed } from '@ember/object';

/*
 * Component helper to truncate text with a 'read more' link.
 */

export default class ReadMoreComponent extends Component {
  tagName = '';
  text = null;
  limit = 20;

  hideFullText = true;

  @computed('limit', 'text')
  get truncatedText() {
    return this.text.substr(0, this.limit);
 }

  @computed('limit', 'text.length')
  get shouldTruncate() {
    return this.text && (this.text.length > this.limit);
  }

  @action
  toggleText() {
    this.toggleProperty('hideFullText');
  }
}
