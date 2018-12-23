import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ModalMultipleEnrollmentComponent extends Component {
  @argument title;
  @argument dialog;
  @argument onClose;
  @argument onConfirm;
}
