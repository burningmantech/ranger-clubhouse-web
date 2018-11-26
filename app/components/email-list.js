import Component from "@ember/component";
import {argument} from "@ember-decorators/argument";
import {action} from "@ember-decorators/object";
import $ from 'jquery';

export default class EmailListComponent extends Component {
  @argument people;

  @action
  copyToClipboardAction() {
    // Find out the element to copy to the clipboard
    const element = $("#email-list").get(0);

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
