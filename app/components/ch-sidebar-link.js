import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';

export default class ChSidebarLinkComponent extends Component {
  get linkBg() {
    return isEmpty(this.args.linkBg) ? 'bg-dark' : this.args.linkBg;
  }

  get iconType() {
    return isEmpty(this.args.iconType) ? 'r' : this.args.iconType;
  }

  get isUrl() {
    const url = this.args.route;
    return !isEmpty(url) && (url == '#' || url.startsWith('http'));
  }
}
