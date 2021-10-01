import Component from '@glimmer/component';
import {action} from '@ember/object';
import Ember from 'ember';
import $ from 'jquery';
import { inject as service } from '@ember/service';

export default class ModalDialogComponent extends Component {
  @service modal;

  isClosed = false;
  dialogBox = null;

  dialogRegistry = {};

  constructor() {
    super(...arguments);


    if (!this.args.isInline) {
      this.dialogRegistry.onEscape = this.args.onEscape;
      this.modal.addDialog(this.dialogRegistry);
    }

    this.modalLocation = !this.args.top ? 'modal-dialog-centered' : '';
  }
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
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (!this.args.isInline) {
      this.modal.removeDialog(this.dialogRegistry);
    }

    if (!this.dialogBox) {
      return;
    }

    const dialog = $(this.dialogBox);
    // Tear down modal
    dialog.modal('hide');
    dialog.modal('dispose');
  }
}
