import Controller from '@ember/controller';
import { set } from '@ember/object';
import { action } from '@ember/object';

export default class AdminErrorLogController extends Controller {

  get previousPage() {
    return this.page - 1;
  }

  get nextPage() {
    return this.page + 1;
  }

  @action
  toggleLog(log) {
    set(log, 'showing', !log.showing);
  }

  @action
  purgeLog() {
    this.modal.confirm('Delete All Error Logs', 'Are you sure you wish to delete the entire error log?', () => {
      this.ajax.request('error-log/purge', { method: 'DELETE' })
      .then(() => this.send('refreshRoute'))
      .catch((response) => this.house.handleErrorResponse(response));
    })
  }
}
