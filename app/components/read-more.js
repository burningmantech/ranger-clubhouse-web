import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/*
 * Component helper to truncate text with a 'read more' link.
 */

export default class ReadMoreComponent extends Component {
  @tracked hideFullText = true;

  constructor() {
    super(...arguments);
    this.limit = this.args.limit ? +this.args.limit : 20;
  }

  get truncatedText() {
    return this.args.text.slice(0, this.limit);
  }

  get shouldTruncate() {
    const text = this.args.text;
    return text && (text.length > this.limit);
  }

  @action
  toggleText() {
    this.hideFullText = !this.hideFullText;
  }
}
