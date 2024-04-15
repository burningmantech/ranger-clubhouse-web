import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {set} from '@ember/object';
import {action} from '@ember/object';

export default class AdminErrorLogController extends ClubhouseController {

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
      this.ajax.request('error-log/purge', {method: 'DELETE'})
        .then(() => this.send('refreshRoute'))
        .catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  isClientException(log) {
    return log.error_type === 'client-ember-error' || log.error_type === 'client-ember-route-error';
  }

  @action
  exceptionDetails(data) {
    try {
      const parsed = JSON.parse(data);
      const details = JSON.parse(parsed.details);
      return {
        exceptionName: parsed.name,
        exceptionMessage: parsed.exception,
        stack: details.stack,
      }
    } catch (SyntaxError) {
      return data;
    }
  }
}
