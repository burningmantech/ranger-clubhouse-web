import ToastService from 'ember-toastr/services/toast';
import ENV from 'clubhouse/config/environment';

export default ToastService.extend({
  config: ENV['ember-toastr'],

  error(title, message = '', options = {}) {
    options.timeOut = 0;
    options.extendedTimeOut = 0;
    options.closeButton = true;

    return this._super(title, message, options);
  }
});
