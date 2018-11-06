import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ModalInfoComponent extends Component {
  @argument title;
  @argument dialog;
  @argument onClose;
  @argument onConfirm;
}
