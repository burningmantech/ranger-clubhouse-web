import Component from '@glimmer/component';
import {service} from '@ember/service';
import {schedule} from '@ember/runloop';
import {action} from '@ember/object';
import ModalService from 'clubhouse/services/modal';

export default class ModalDialogComponent extends Component {
  @service modal;

  /**
   * Register a non-inline modal with the modal service. The service handles
   * the <Escape> key callbacks, and causes the modal to be rendered via modal-registry.js
   */

  constructor() {
    super(...arguments);

    if (this.args.isInline) {
      // An inline modal has already been registered.
      this.modalId = this.args.modalId;
      return;
    }

    this.modalId = ModalService.getNewModalId();
    this.modalEntry = {
      modalId: this.modalId,
      onEscape: this.args.onEscape,
      show: this._showDialog,
      hide: this._hideDialog,
    };

    schedule('afterRender', () => this.modal.addDialog(this.modalEntry));
  }

  get isTopDialog() {
    const idx = this.modal.dialogs.length;
    if (!idx) {
      // ... Because there's a delay between creating a modal and adding it into the registry
      return false;
    }
    return this.modal.dialogs[idx - 1].modalId === this.modalId;
  }

  /**
   * Hack - <BSModal> does not have a fullscreen option, nor a way to add
   * a class to the inner .modal-dialog div.
   *
   * @param {HTMLElement} element
   */

  @action
  adjustClassOnInsert(element) {
    /*
      const dialog = element.querySelector('div.modal-dialog');
      if (!dialog) {
         return;
      }
      dialog.classList.add('modal-fullscreen-xl-down');
     */

    this.args.onInsert?.(element);
  }

  /**
   * Remove a non-inline dialog from the modal service when destroyed.
   */

  willDestroy() {
    super.willDestroy(...arguments);
    if (!this.args.isInline) {
      this.modal.removeDialog(this.modalEntry);
    }
  }
}
