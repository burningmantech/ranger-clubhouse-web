import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import $ from 'jquery';

export default class ChAccordionComponent extends Component {
  @tracked isOpen = false;
  bodyElement = null;

  @action
  onClickAction() {
    if (!this.bodyElement) {
      return; // unlikely, but ya never know..
    }

    $(this.bodyElement).collapse('toggle');
  }

  @action
  onInsertAction(element) {
    this.bodyElement = element;
    $(element).on('shown.bs.collapse', () => {
      this.isOpen = true;
    }).on('hidden.bs.collapse', () => {
      this.isOpen = false;
    });
  }

  @action onDestroyAction(element) {
    $(element).collapse('dispose');
  }
}
