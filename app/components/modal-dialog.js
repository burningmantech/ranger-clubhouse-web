import Component from '@glimmer/component';
import {service} from '@ember/service';
import {schedule} from '@ember/runloop';

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
    schedule('afterRender', () => this.modal.addDialog(this.dialogRegistry));
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (!this.args.isInline) {
      this.modal.removeDialog(this.dialogRegistry);
    }
  }
}
