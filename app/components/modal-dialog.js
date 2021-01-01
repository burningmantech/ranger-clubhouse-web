import Component from '@glimmer/component';
import {action} from '@ember/object';
import Ember from 'ember';
import $ from 'jquery';

export default class ModalDialogComponent extends Component {
  isClosed = false;
  dialogBox = null;

  // #modal-render lives in application.hbs
  // during testing the use ember-testing instead since modal-render does not exist.
  get destinationElement() {
    // eslint-disable-line ember/no-ember-testing-in-module-scope
    return document.querySelector(Ember.testing ? '#ember-testing' : '#modal-render');
  }

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
    super.willDestroy(...arguments);

    if (!this.dialogBox) {
      return;
    }

    const dialog = $(this.dialogBox);
    // Tear down modal
    dialog.modal('hide');
    dialog.modal('dispose');
  }
}
