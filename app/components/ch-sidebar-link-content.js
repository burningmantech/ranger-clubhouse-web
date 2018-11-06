import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { classNames, tagName } from '@ember-decorators/component';

@tagName('')
@classNames('d-flex', 'w-100', 'justify-content-start', 'align-items-center')
export default class ChSidebarLinkContentComponent extends Component {
  @argument iconUrl;
  @argument icon;
  @argument iconType;
  @argument title;
  @argument badgeText;
}
