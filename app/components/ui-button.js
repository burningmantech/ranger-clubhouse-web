import Component from '@glimmer/component';

export default class UiButtonComponent extends Component {
  constructor() {
    super(...arguments);
    this.sizeClass = this.args.size ? `btn-${this.args.size}` : '';
  }

  get typeClass() {
    return `btn-${this.args.type ?? 'primary'}`;
  }
}
