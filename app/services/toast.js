import Service from '@ember/service';
import {A} from '@ember/array';
import {tracked} from '@glimmer/tracking';

const TIMEOUT = 7000;

export default class extends Service {
  @tracked loaf = A();

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
    this.loaf.pushObject(toast);
    if (toast.type !== 'danger') {
      toast.timerId = setTimeout(() => this.loaf.removeObject(toast), TIMEOUT);
    }
  }

  removeToast(toast) {
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }

    this.loaf.removeObject(toast);
  }

  clear() {
    this.loaf.forEach((toast) => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
        toast.timerId = null;
      }
    });

    this.loaf = A();
  }
}
