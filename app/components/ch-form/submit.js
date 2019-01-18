import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

@tagName('')
export default class ChFormSubmitComponent extends Component {
  @argument(optional('string')) label;
  @argument(optional('string')) submitClass;
  @argument(optional('boolean')) disabled;
  @argument(optional('object')) formSubmitAction; // Form submit action
  @argument('object') onSubmit; // Form submit action

 init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.label = 'Save';
    }
  }

  @action
  submitAction() {
    this.formSubmitAction(this.onSubmit);
  }
}
