import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

const ICONS = {
  success: 'check',
  danger: 'exclamation-triangle',
  warning: 'exclamation',
};

export default class ToastDialogComponent extends Component {
  @service toast;
  @service session;

  constructor() {
    super(...arguments);

    this.iconName = ICONS[this.args.toast.type];
    this.message = htmlSafe(this.args.toast.message);
  }

  @action
  closeAction() {
    this.toast.removeToast(this.args.toast);
  }
}
