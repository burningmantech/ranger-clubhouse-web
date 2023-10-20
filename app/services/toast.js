import Service from '@ember/service';
import {tracked} from 'tracked-built-ins';
import _ from 'lodash';

const TIMEOUT = 7000;

export default class extends Service {
  loaf = tracked([]);

  success(message) {
    this.addToast({message, type: 'success'});
  }

  warning(message) {
    this.addToast({message, type: 'warning'});
  }

  error(message) {
    this.addToast({message, type: 'danger'});
  }

  addToast(toast) {
    this.loaf.push(toast);
    if (toast.type !== 'danger') {
      toast.timerId = setTimeout(() => _.pull(this.loaf, toast), TIMEOUT);
    }
  }

  removeToast(toast) {
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }

    _.pull(this.loaf, toast);
  }

  clear() {
    this.loaf.forEach((toast) => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
        toast.timerId = null;
      }
    });

    // would be nice if tracked arrays could be reset by simply doing let x = [];
    while(this.loaf.length) {
      this.loaf.pop();
    }
  }
}
