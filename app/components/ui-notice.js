import Component from '@glimmer/component';

export default class ChNoticeComponent extends Component {
  constructor() {
    super(...arguments);
    const {type, icon, iconSize}  = this.args;

    this.boxColor = type ? `alert-${type}` : 'alert-secondary';
    this.icon = icon ?? 'exclamation';
    this.iconSize = iconSize ?? "2x";
  }
}
