import Component from '@glimmer/component';
import { action } from '@ember/object';
import $ from 'jquery';

export default class ModalDialogComponent extends Component {
  isClosed = false;
  dialogBox = null;

  @action
  boxInserted(element) {
    this.dialogBox = element;

    const dialog = $(element);

    // Setup modal, and attach to show & hide events
    dialog.modal({backdrop: 'static', keyboard: false});
    dialog.modal().on('show.bs.modal', () => {
      return this.args.onShow ? this.args.onShow() : null;
    });

    dialog.modal().on('hide.bs.modal', () => {
      if (!this.isClosed) {
        this.isClosed = true;
        return this.args.onClose ? this.args.onClose() : null;
      }
    });
  }

  willDestroy() {
    if (!this.dialogBox) {
      return;
    }

    const dialog = $(this.dialogBox);
    // Tear down modal
    dialog.modal('hide');
    dialog.modal('dispose');
  }
}
