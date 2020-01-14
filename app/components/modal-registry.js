import Component from '@ember/component';
import { action } from '@ember/object';

export default class ModalRegistryComponent extends Component {
  classNames = [ 'modal-registry' ];

  @action
  close() {
    this.modal.closeAction();
  }

  @action
  confirm() {
    this.modal.confirmAction()
  }
}
