import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class VcApplicationEmailPreviewComponent extends Component {
  @action
  insertPreviewEmail(element) {
    const iframe = element.contentWindow.document;

    iframe.open();
    iframe.write(this.args.emailHtml);
    iframe.close();
  }
}
