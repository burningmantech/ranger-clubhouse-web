import Component from '@ember/component';
import { tagName, classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('div')
@classNames('card', 'mb-3')
export default class ChBoxComponent extends Component {
  static positionalParams =  [ 'title' ];

  // Box title
  @argument title;

  // Box type/size (sm, md, lg)
  @argument type;

  // Title icon
  @argument icon;

  // If true, then card-body div is not emitted.
  @argument noBody = false;
}
