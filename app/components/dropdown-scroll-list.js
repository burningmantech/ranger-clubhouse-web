import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class DropdownScrollListComponent extends Component {
  @service house;

  @cached
  get letterOptions() {
    const letters = {};

    this.args.items.forEach((p) => {
      const letter = p.title.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = [];
      }
      letters[letter].push({id: p.id, title: p.title});
    });

    return Object.keys(letters).sort().map((letter) => ({letter, items: letters[letter]}));
  }

  @action
  scrollToItem(id, closeMenu) {
    if (this.args.openAccordion) {
      document.querySelector(`#${id} .accordion-title button`)?.click();
      setTimeout(() => this._scrollToElement(id), 350);
    } else {
      this._scrollToElement(id);
    }

    closeMenu();
  }

  _scrollToElement(id) {
    if (this.args.blinkBox) {
      const element = document.querySelector(`#${id}`);
      if (element) {
        const {top, bottom} = element.getBoundingClientRect();

        if (!(bottom > window.innerHeight || top < 0)) {
          // Already in view.
          this._setupAnimation(element);
          return;
        }

        this.animatedElement = element;
        window.addEventListener('scrollend', this._scrollEnded);
      }
    }

    this.house.scrollToElement(`#${id}`, true, true);
  }

  @action
  _scrollEnded() {
    window.removeEventListener('scrollend', this._scrollEnded);
    this._setupAnimation(this.animatedElement);
  }

  @action
  _setupAnimation(element) {
    this.animatedElement = element;
    const isTable =  element.nodeName === 'TR';
    this.animatedClass = isTable ? 'blink-row' : 'blink-box';
    element.addEventListener('animationend', this._removeAnimation);
    element.classList.add(this.animatedClass);
    this.animatedTable = element.closest('table');
    if (this.animatedTable) {
      this.animatedTable.classList.remove('table-striped');
    }
  }

  @action
  _removeAnimation() {
    this.animatedElement.classList.remove(this.animatedClass);
    this.animatedElement.removeEventListener('animationend', this._removeAnimation);
    if (this.animatedTable) {
      this.animatedTable.classList.add('table-striped');
    }
  }
}
