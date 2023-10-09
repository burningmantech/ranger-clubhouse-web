import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from '@ember/service';

export default class EmailListComponent extends Component {
  @service house;
  @service toast;

  constructor() {
    super(...arguments);

    this.listId = this.args.listId || 'email-list';
  }

  @action
  elementInserted() {
    if (!this.args.scrollOnRender) {
      return;
    }

    this.house.scrollToElement(`#${this.listId}-link`);
  }

  @action
  copyToClipboardAction(event) {
    event.preventDefault();

    // Find out the element to copy to the clipboard
    const element = document.querySelector('#'+this.listId);

    if (!element) {
      this.toast.error("Cannot locate element");
      return;
    }

    this.house.copyToClipboard(element);
  }
}
