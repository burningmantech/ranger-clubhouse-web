import Component from '@ember/component';
import { tagName, classNames } from '@ember-decorators/component';



@tagName('div')
@classNames('card', 'mb-3')
export default class ChBoxComponent extends Component {
  static positionalParams =  [ 'title' ];

  // Box title
  title = null;

  // Box type/size (sm, md, lg)
  type = null;

  // Title icon
  icon = null;

  // If true, then card-body div is not emitted.
  noBody = false;
}
