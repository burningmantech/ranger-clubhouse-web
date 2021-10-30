import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import bootstrap from 'bootstrap';

export default class ModalDialogComponent extends Component {
  @service modal;

  dialogRegistry = {};

  constructor() {
    super(...arguments);

    if (this.args.isInline) {
      // An inline modal has already been registered.
      return;
    }

    this.dialogRegistry.onEscape = this.args.onEscape;
    this.modal.addDialog(this.dialogRegistry);
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
