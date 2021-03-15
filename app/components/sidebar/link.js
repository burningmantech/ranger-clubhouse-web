import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';

export default class SidebarLinkComponent extends Component {

  get linkClass() {
    return this.args.renderAsDropdown ? 'dropdown-item' : 'sidebar-link';
  }

  get activeClass() {
    return this.args.renderAsDropdown ? 'active' : 'sidebar-active';

  }

  get theme() {
    return isEmpty(this.args.theme) ? 'default' : this.args.theme;
  }

  get iconType() {
    return isEmpty(this.args.iconType) ? 'r' : this.args.iconType;
  }

  get isUrl() {
    const url = this.args.route;
    return !isEmpty(url) && (url === '#' || url.startsWith('http'));
  }
}
