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

    return Object.keys(letters).sort().map((letter) => {
      return {letter, items: letters[letter]};
    });
  }

  @action
  scrollToItem(id) {
    if (this.args.openAccordion) {
      document.querySelector(`#${id} .accordion-title`)?.click();
      setTimeout(() => this._scrollToElement(id), 350);
    } else {
      this._scrollToElement(id);
    }
  }

  _scrollToElement(id) {
    this.house.scrollToElement(`#${id}`, true, true);
  }
}
