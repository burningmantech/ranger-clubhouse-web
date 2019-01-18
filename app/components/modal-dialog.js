import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import $ from 'jquery';

export default class ModalDialogComponent extends Component {
  @argument(optional('string')) title;

  @argument(optional('object')) onConfirm;
  @argument(optional('object')) onClose;
  @argument(optional('object')) onShow;

  didInsertElement() {
    super.didInsertElement(...arguments);
    const dialog = $('#dialog-box');

    // Setup modal, and attach to show & hide events
    dialog.modal({backdrop: 'static', keyboard: false});
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
