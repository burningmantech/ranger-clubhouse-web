import Component from '@ember/component';
import { tagName, classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

@tagName('div')
@classNames('card', 'mb-3')
export default class ChBoxComponent extends Component {
  static positionalParams =  [ 'title' ];

  // Box title
  @argument('string') title;

  // Box type/size (sm, md, lg)
  @argument(optional('string')) type;

  // Title icon
  @argument(optional('string')) icon;

  // If true, then card-body div is not emitted.
  @argument(optional('boolean')) noBody = false;
}
