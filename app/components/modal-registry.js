import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { action } from '@ember/object';

@classNames('modal-registry')
export default class ModalRegistryComponent extends Component {
  @action
  close() {
    this.modal.closeAction();
  }

  @action
  confirm() {
    this.modal.confirmAction()
  }
}
