import Component from '@glimmer/component';

export default class UiNoticeComponent extends Component {
  get icon() {
    return this.args.icon ?? 'exclamation';
  }

  get color() {
    return (this.args.type ?? 'secondary');
  }

  get iconColor() {
    if (this.args.iconColor) {
      return this.args.iconColor;
    }

    if (this.color === 'warning') {
      return 'black';
    } else if (this.color === 'danger' || this.color === 'secondary') {
      return 'white;'
    } else {
      return this.color;
    }
  }
}
