import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {createPopper} from '@popperjs/core';

export default class PopoverComponent extends Component {
  @tracked isShowing = false;

  containerElement = null;
  blockElement = null;

  popper = null;

  constructor() {
    super(...arguments);

    const {placement} = this.args;
    this.placement = (placement ? `popover-${placement}` : '');
  }

  @action
  containerInserted(element) {
    this.containerElement = element;
  }

  @action
  blockInserted(element) {
    this.blockElement = element;
    this.popper = createPopper(this.containerElement, this.blockElement);
  }

  @action
  showAction(element) {
    element.preventDefault();
    document.querySelector('body').addEventListener('keyup', this._keyEvent);
    this.isShowing = true;
  }

  @action
  closeAction() {
    this._cleanup();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._cleanup();
  }

  @action
  _keyEvent(event) {
    if (event.key !== 'Escape') {
      return true;
    }

    event.stopPropagation();
    this._cleanup();
    return false;
  }

  _cleanup() {
    if (!this.isShowing) {
      return;
    }

    document.querySelector('body').removeEventListener('keyup', this._keyEvent);
    this.isShowing = false;
    this.popper.destroy();
  }


}
