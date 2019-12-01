import Component from '@ember/component';


import $ from 'jquery';

export default class ModalDialogComponent extends Component {
  title = null;

  onConfirm = null;
  onClose = null;
  onShow = null;

  confirmLabel = 'Confirm';
  cancelLabel = 'Cancel';
  closeLabel = 'Close';

  isClosed = false;

  didInsertElement() {
    super.didInsertElement(...arguments);
    const dialog = $('#dialog-box');

    // Setup modal, and attach to show & hide events
    dialog.modal({backdrop: 'static', keyboard: false});
    dialog.modal().on('show.bs.modal', () => {
      return this.onShow ? this.onShow() : null;
    });

    dialog.modal().on('hide.bs.modal', () => {
      if (!this.isClosed) {
        this.isClosed = true;
        return this.onClose ? this.onClose() : null;
      }
    });
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    const dialog = $('#dialog-box');

    // Tear down modal
    dialog.modal('hide');
    dialog.modal('dispose');
  }
}
