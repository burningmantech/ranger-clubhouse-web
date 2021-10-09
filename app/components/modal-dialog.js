import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class ModalDialogComponent extends Component {
  @service modal;

  isClosed = false;
  dialogBox = null;

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
    this._element.style.display = 'block';
    this._element.scrollTop = 0;
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (!this.args.isInline) {
      this.modal.removeDialog(this.dialogRegistry);
    }
  }
}
