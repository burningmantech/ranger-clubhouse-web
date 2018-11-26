import ToastService from 'ember-toastr/services/toast';

export default ToastService.extend({
  error(title, message = '', options = {}) {
    options.timeOut = 0;
    options.extendedTimeOut = 0;
    options.closeButton = true;

    return this._super(title, message, options);
  }
});
