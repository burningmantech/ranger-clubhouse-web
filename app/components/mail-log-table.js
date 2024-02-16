import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MailLogTableComponent extends Component {
  @tracked mailLog;

  @action
  showMailLogAction(log) {
    this.mailLog = log;
  }

  /**
   * Load up the newly inserted iframe with the email body
   *
   * @param {HTMLElement} element
   */

  @action
  insertMailLogBody(element) {
    const iframe = element.contentWindow.document;

    let {body} = this.mailLog;

    if (!body.match(/<html/i)) {
      body = body.trim();
      if (body === '') {
        body = `<html lang="en"><body><i>Message body is empty.</i></body></html>`;
      } else {
        // If plain text, go ahead and wrap it up, and break on newlines.
        body = body.replace(/(\r\n|\r|\n){2,}$/g, '$1\n');
        body = body.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
        body = `<html lang="en"><body>${body}</body></html>`;
      }
    }


    iframe.open();
    iframe.write(body);
    iframe.close();
  }

  @action
  closeMailLogAction() {
    this.mailLog = null;
  }
}
