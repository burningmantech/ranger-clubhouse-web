import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class UiButtonComponent extends Component {
  constructor() {
    super(...arguments);
    this.sizeClass = this.args.size ? `btn-${this.args.size}` : '';
  }

  get typeClass() {
    return `btn-${this.args.type ?? 'primary'}`;
  }

  @action
  clickAction(e) {
    e.stopPropagation();
    e.target.blur();
    this.args.onClick();
  }
}
