import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import bootstrap from 'bootstrap';
import { schedule } from '@ember/runloop';
import Ember from 'ember';

export default class ModalDialogComponent extends Component {
  @service modal;

  dialogRegistry = {};

  constructor() {
    super(...arguments);

    this.registryId = document.getElementById(Ember.testing ? 'ember-testing' : 'modal-container');

    if (!this.registryId) {
      throw new Error('Missing modal container');
    }

    if (this.args.isInline) {
      // An inline modal has already been registered.
      return;
    }

    this.dialogRegistry.onEscape = this.args.onEscape;

    schedule('afterRender', () => this.modal.addDialog(this.dialogRegistry));
  }

  @action
  boxInserted(element) {
    this._element = element;
    this.bootstrapModal = new bootstrap.Modal(this._element, {keyboard: false});
    this.bootstrapModal.show();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.bootstrapModal) {
      this.bootstrapModal.hide();
    }

    if (!this.args.isInline) {
      this.modal.removeDialog(this.dialogRegistry);
    }
  }
}
