import Component from '@glimmer/component';

export default class UiLoadingComponent extends Component {
  get variant() {
    return this.args.variant ?? 'inline';
  }

  get text() {
    return this.args.text ?? 'Loading';
  }

  get isInline() {
    return this.variant === 'inline';
  }

  get isSection() {
    return this.variant === 'section';
  }

  get isModal() {
    return this.variant === 'modal';
  }
}