import Service from '@ember/service';
import {A} from '@ember/array';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

/*
  The modal service. Handles inline modals (aka this.modal.{info,confirm,open}) and
  regular modals (<ModalDialog ... />).

  The <ESC> key is processed here if one or more dialogs are shown and the appropriate callback dispatched.

  An inline modal is one created in a controller or component's javascript and not the template.
  (e.g., this.modal.info('Signed up!', 'You have signed up for the new shift.') );
 */

export default class ModalService extends Service {
  @tracked dialogs = A();

  constructor() {
    super(...arguments);

    // Bind this so window.{add|remove}EventListener works
    this._checkForEscape = this._checkForEscape.bind(this);
  }

  /**
   * Opens the modal-info dialog
   *
   * @param {string|null} title
   * @param {string} message
   * @param {Function|null} closeCallback
   */

  info(title, message, closeCallback = null) {
    this.addInlineDialog({
      component: 'modal-info', title, message, closeCallback
    });
  }

  /**
   * Opens the modal-confirm dialog
   *
   * @param {string|null} title
   * @param {string} message
   * @param {Function} confirmCallback
   * @param {Function|null} closeCallback
   */

  confirm(title, message, confirmCallback , closeCallback = null) {
    this.addInlineDialog({
      component: 'modal-confirm', title, message, confirmCallback, closeCallback
    });
  }

  /**
   * Opens a modal file (app/components/modal-*.hbs)
   *
   * @param {string} component
   * @param {*} data
   * @param {Function} confirmCallback
   * @param {Function|null} closeCallback
   */
  open(component, data, confirmCallback, closeCallback) {
    this.addInlineDialog({
      component, data, confirmCallback, closeCallback
    });
  }

  /**
   * Adds an inline dialog to the dialog list.
   *
   * @param {Object} dialog
   */

  addInlineDialog(dialog) {
    dialog.isInline = true;
    this.addDialog(dialog);
  }

  /**
   * Adds a dialog either from this service or from the ModalDialog component
   * @param {Object} dialog
   */

  addDialog(dialog) {
    this.dialogs.pushObject(dialog);

    if (this.dialogs.length === 1) {
      // First dialog to show up, setup the keyboard listener
      window.addEventListener('keyup', this._checkForEscape);
    }
  }

  /**
   * Removes a dialog from the list.
   *
   * @param {Object} dialog
   */

  removeDialog(dialog) {
    if (this.isRemoved ) {
      // Don't re-remove a dialog already gotten rid of.
      return;
    }

    this.dialogs.removeObject(dialog);
    dialog.isRemoved = true;

    if (this.dialogs.length === 0) {
      // Remove the keyboard listener in case this was the last one.
      window.removeEventListener('keyup', this._checkForEscape);
    }
  }

  /**
   * Processes an Escape key press (up) and calls the appropriate callback if one
   * is registered OR in the case of an inline dialog, just close it regardless.
   *
   * @param {KeyboardEvent} event
   * @returns {boolean}
   * @private
   */

  _checkForEscape(event) {
    if (event.code !== 'Escape') {
      return true;
    }

    const dialog = this.dialogs.lastObject;

    if (dialog.isInline || dialog.closeCallback || dialog.onEscape) {
      event.stopPropagation(); // Don't allow the key to percolate upwards
      this.removeDialog(dialog);
      if (dialog.closeCallback) {
        dialog.closeCallback();
      } else if (dialog.onEscape) {
        dialog.onEscape();
      }
      return false;
    } else {
      return true;
    }
  }

  /**
   * Close button action for an inline dialog
   */

  @action
  closeAction() {
    const dialog = this.dialogs.lastObject;

    this.removeDialog(dialog);
    if (dialog && dialog.closeCallback) {
      dialog.closeCallback();
    }
  }

  /**
   * Confirm button action for an inline dialog.
   */

  @action
  confirmAction() {
    const dialog = this.dialogs.lastObject;
    this.removeDialog(dialog);
    dialog.confirmCallback();
  }
}
