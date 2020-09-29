import Service from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';

export default class ModalService extends Service {
  dialogs = A();

  info(title, message, closeCallback=null) {
    this.dialogs.pushObject({
      component: 'modal-info', title, message, closeCallback
    });
  }

  confirm(title, message, confirmCallback, closeCallback) {
    this.dialogs.pushObject({
      component: 'modal-confirm', title, message, confirmCallback, closeCallback
    });
  }

  open(component, data, confirmCallback, closeCallback) {
    this.dialogs.pushObject({
      component, data, confirmCallback, closeCallback
    });
  }

  @action
  closeAction() {
    const dialog = this.dialogs.shiftObject();

    if (dialog && dialog.closeCallback) {
      dialog.closeCallback();
    }
  }

  @action
  confirmAction() {
    const dialog = this.dialogs.shiftObject();
    dialog.confirmCallback();
  }
}
