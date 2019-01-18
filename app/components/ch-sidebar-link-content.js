import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { classNames, tagName } from '@ember-decorators/component';

@tagName('')
@classNames('d-flex', 'w-100', 'justify-content-start', 'align-items-center')
export default class ChSidebarLinkContentComponent extends Component {
  @argument(optional('any')) iconUrl;
  @argument(optional('any')) icon;
  @argument(optional('any')) iconType;
  @argument(optional('any')) title;
  @argument(optional('any')) badgeText;
}
