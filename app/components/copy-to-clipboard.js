import Component from '@glimmer/component';
import { action } from '@ember/object';
import {service} from '@ember/service';

export default class CopyToClipboardComponent extends Component {
  @service house;

  @action
  copyText() {
    this.house.copyToClipboard(this.args.text);
  }
}
