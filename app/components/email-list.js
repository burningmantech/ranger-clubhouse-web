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

    // Create a Range object used to select the element's text.
    const range = document.createRange();
    const selection = window.getSelection();

    // Select the text into the range
    range.selectNodeContents(element);
    // Remove previously selected range
    selection.removeAllRanges();
    // And now set the new range
    selection.addRange(range);

    try {
      // Copy the selection to the clipboard
      document.execCommand("copy");
    } catch (err) {
      this.toast.error(
        "Sorry, unable to copy the text to the clipboard. Error: " + err
      );
      return;
    }

    selection.removeAllRanges();
    this.toast.success("Emails have been copied to the clipboard");
  }
}
