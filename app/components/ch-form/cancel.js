import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

@tagName('')
export default class ChFormCancelComponent extends Component {
  @argument(optional('string')) label;
  @argument(optional('string')) cancelClass;
  @argument(optional('boolean')) disabled;
  @argument(optional('object')) cancelAction;

  init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.label = 'Cancel';
    }
  }
}
