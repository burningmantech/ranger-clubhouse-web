import Component from '@ember/component';


import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ChSidebarGroupComponent extends Component {
  static positionalParams = [ 'title' ];

  title = null;
}
