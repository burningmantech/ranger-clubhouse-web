import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import { action } from '@ember/object';

const ICONS = {
  success: 'check',
  error: 'exclamation-triangle',
  warning: 'exclamation',
};

export default class ToastDialogComponent extends Component {
  @service toast;
  @service session;

  constructor() {
    super(...arguments);

    this.iconName = ICONS[this.args.toast.type];
  }

  @action
  closeAction() {
    this.toast.removeToast(this.args.toast);
  }
}
