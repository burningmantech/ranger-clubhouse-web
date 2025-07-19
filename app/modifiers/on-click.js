import Modifier from 'ember-modifier';
import {registerDestructor} from '@ember/destroyable'

export default class OnClick extends Modifier {
  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, this.cleanup);
  }

  modify(element, [clickCallback], namedArgs) {
    let active;
    if ('active' in namedArgs) {
      active = namedArgs.active;
    } else {
      active = true;
    }

    if (this.active) {
      this.cleanup();
    }

    this.element = element;
    this.active = active;
    this.clickCallback = clickCallback;

    if (this.active) {
      element.addEventListener('click', this.onClick);
    }
  }

  cleanup = () => {
    this.element?.removeEventListener('click', this.onClick);
  }

  onClick = (event) => {
    event.preventDefault();
    this.clickCallback(event);
  }
}
