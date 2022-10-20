import Component from '@glimmer/component';
import {service} from '@ember/service';
import {schedule} from '@ember/runloop';
import {action} from '@ember/object';

export default class ModalDialogComponent extends Component {
  @service modal;

  dialogRegistry = {};

  /**
   * Register a non-inline modal with the modal service. The service handles
   * the <Escape> key callbacks, and causes the modal to be rendered via modal-registry.js
   */

  constructor() {
    super(...arguments);

    if (this.args.isInline) {
      // An inline modal has already been registered.
      return;
    }

    this.dialogRegistry.onEscape = this.args.onEscape;
    schedule('afterRender', () => this.modal.addDialog(this.dialogRegistry));
  }

  /**
   * Hack - <BSModal> does not have a fullscreen option, nor a way to add
   * a class to the inner .modal-dialog div.
   *
   * @param {HTMLElement} element
   */

  @action
  adjustClassOnInsert(/*element*/) {
    /*
      const dialog = element.querySelector('div.modal-dialog');
      if (!dialog) {
         return;
      }
      dialog.classList.add('modal-fullscreen-xl-down');
     */
  }

  /**
   * Remove a non-inline dialog from the modal service when destroyed.
   */

  willDestroy() {
    super.willDestroy(...arguments);
    if (!this.args.isInline) {
      this.modal.removeDialog(this.dialogRegistry);
    }
  }
}
