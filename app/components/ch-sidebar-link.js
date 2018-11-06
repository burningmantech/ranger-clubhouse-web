import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { classNames, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
@classNames('bg-dark', 'list-group-item', 'list-group-item-action')
export default class ChSidebarLinkComponent extends Component {
  static positionalParams = [ 'routePath', 'routeArg' ];

  @argument title;
  @argument icon;
  @argument iconType = 'r';
  @argument iconUrl;
  @argument routePath;
  @argument routeArg;
  @argument badgeText;

  @computed('routePath')
  get isUrl() {
    const url = this.routePath;

    if (url == '') {
      return false;
    }

    return (url == '#' || url.startsWith('http'));
  }
}
