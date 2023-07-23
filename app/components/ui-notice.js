import Component from '@glimmer/component';

export default class UiNoticeComponent extends Component {
  get icon() {
    return this.args.icon ?? 'exclamation';
  }

   get color() {
    return (this.args.type ?? 'secondary');
  }

  get iconColor() {
    return this.args.iconColor ?? this.color;
  }
}
