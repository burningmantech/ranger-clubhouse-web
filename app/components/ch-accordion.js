import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {schedule} from '@ember/runloop';
import bootstrap from 'bootstrap';


export default class ChAccordionComponent extends Component {
  @tracked isOpen = false;
  bodyElement = null;

  @action
  onClickAction() {
    if (!this.bodyElement) {
      return; // unlikely, but ya never know..
    }

    if (this.isOpen) {
      // hidden event will deal with things
      this.bodyCollapse.hide();
      return;
    }

    this.isOpen = true;
    if (this.args.onClick) {
      this.args.onClick(true);
    }

    // Reveal body after it's rendered
    schedule('afterRender', () => this.bodyCollapse.show());
  }

  @action
  onInsertAction(element) {
    this.bodyElement = element;
    this.bodyCollapse = new bootstrap.Collapse(element, { toggle: false });

    element.addEventListener('hidden.bs.collapse', () => {
      this.isOpen = false;
      if (this.args.onClick) {
        this.args.onClick(false);
      }
    });

    element.addEventListener('shown.bs.collapse', () => {
      if (this.isOpen) {
        return;
      }
      schedule('afterRender', () => this.isOpen = true);
    });

    if (this.args.isInitOpen) {
      this.isOpen = true;
    }
  }

  @action
  onDestroyAction() {
    if (this.bodyElement) {
      this.bodyCollapse.dispose();
    }
  }
}
