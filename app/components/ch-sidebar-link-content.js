import Component from '@ember/component';


import { classNames, tagName } from '@ember-decorators/component';

@tagName('')
@classNames('d-flex', 'w-100', 'justify-content-start', 'align-items-center')
export default class ChSidebarLinkContentComponent extends Component {
  iconUrl = null;
  icon = null;
  iconType = null;
  title = null;
  badgeText = null;
}
