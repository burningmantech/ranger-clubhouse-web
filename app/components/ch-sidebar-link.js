import Component from '@ember/component';
import { computed } from '@ember/object';
import { classNames, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { isEmpty } from '@ember/utils';

@tagName('')
@classNames('bg-dark', 'list-group-item', 'list-group-item-action')
export default class ChSidebarLinkComponent extends Component {
  static positionalParams = [ 'routePath', 'routeArg' ];

  @argument(optional('string')) title;
  @argument(optional('string')) icon;
  @argument(optional('string')) iconType = 'r';
  @argument(optional('string')) iconUrl;
  @argument(optional('any')) routePath;
  @argument(optional('any')) routeArg;
  @argument(optional('any')) badgeText;

  @computed('routePath')
  get isUrl() {
    const url = this.routePath;

    if (isEmpty(url)) {
      return false;
    }

    return (url == '#' || url.startsWith('http'));
  }
}
