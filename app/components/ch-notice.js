import Component from '@glimmer/component';

export default class ChNoticeComponent extends Component {
  get iconSize() {
    return this.args.iconSize ?? "2x";
  }

  get boxColor() {
    const {type}  = this.args;
    return type ? `notice-${type}` : '';
  }
}
