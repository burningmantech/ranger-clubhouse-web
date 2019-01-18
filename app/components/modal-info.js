import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

export default class ModalInfoComponent extends Component {
  @argument(optional('string')) title;
  @argument(optional('object')) dialog;
  @argument(optional('object')) onClose;
  @argument(optional('object')) onConfirm;
}
