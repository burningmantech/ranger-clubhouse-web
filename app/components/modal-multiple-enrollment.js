import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { alias } from '@ember-decorators/object/computed';

export default class ModalMultipleEnrollmentComponent extends Component {
  @argument(optional('object')) dialog;
  @argument(optional('object')) onClose;
  @argument(optional('object')) onConfirm;

  @alias('dialog.data') data;
}
