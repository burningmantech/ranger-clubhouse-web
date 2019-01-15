import Service from '@ember/service';
import { A } from '@ember/array';

export default Service.extend({
  dialogs: A(),

  info(title, message, closeCallback=null) {
    this.open('modal-info', title, message, null, closeCallback);
  },

  confirm(title, message, confirmCallback, closeCallback) {
    this.open('modal-confirm', title, message, confirmCallback, closeCallback)
  },

  open(component, title, message, confirmCallback, closeCallback) {
    this.dialogs.pushObject({
      component, title, message, confirmCallback, closeCallback
    });
  },

  closeAction() {
    const dialog = this.dialogs.shiftObject();

    if (dialog && dialog.closeCallback) {
      dialog.closeCallback();
    }
  },

  confirmAction() {
    const dialog = this.dialogs.shiftObject();
    dialog.confirmCallback();
  }
});
