import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class UiButtonComponent extends Component {
  constructor() {
    super(...arguments);
    const{size} = this.args;
    if (size === 'md') {
      this.sizeClass = '';
    } else {
      this.sizeClass = size ? `btn-${size}` : 'btn-sm';
    }
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
