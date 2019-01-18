import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { isEmpty } from '@ember/utils';

@tagName('')
export default class ChFormResetButtonComponent extends Component {
  @argument(optional('object')) resetAction;
  @argument(optional('string')) label;
  @argument(optional('boolean')) disabled;

  init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.label = 'Reset';
    }
  }
}
