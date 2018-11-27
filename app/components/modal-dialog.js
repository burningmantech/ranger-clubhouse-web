import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import $ from 'jquery';

export default class ModalDialogComponent extends Component {
  @argument title;

  @argument onConfirm;
  @argument onClose;
  @argument onShow;

  didInsertElement() {
    super.didInsertElement(...arguments);
    const dialog = $('#dialog-box');

    // Setup modal, and attach to show & hide events
    dialog.modal({backdrop: 'static'});
    dialog.modal().on('show.bs.modal', () => {
      return this.onShow ? this.onShow() : null;
    });

    dialog.modal().on('hide.bs.modal', () => {
      return this.onClose ? this.onClose() : null;
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
