import Component from '@ember/component';
import { computed } from '@ember/object';
import { classNames, tagName } from '@ember-decorators/component';


import { isEmpty } from '@ember/utils';

@tagName('')
@classNames('bg-dark', 'list-group-item', 'list-group-item-action')
export default class ChSidebarLinkComponent extends Component {
  static positionalParams = [ 'routePath', 'routeArg' ];

  title = null;
  icon = null;
  iconType = 'r';
  iconUrl = null;
  routePath = null;
  routeArg = null;
  badgeText = null;
  linkBg = 'bg-dark';

  @computed('routePath')
  get isUrl() {
    const url = this.routePath;

    if (isEmpty(url)) {
      return false;
    }

    return (url == '#' || url.startsWith('http'));
  }
}
