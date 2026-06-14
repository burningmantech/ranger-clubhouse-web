import Component from '@glimmer/component';
import { action } from '@ember/object';
import {service} from '@ember/service';

export default class CopyToClipboardComponent extends Component {
  @service browser;
  @action
  copyText() {
    this.browser.copyToClipboard(this.args.text);
  }
}
