import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { set } from '@ember/object';

export default class PersonBroadcastLogController extends Controller {
  queryParams = [ 'year' ];

  @action
  showMessageAction(log) {
    set(log, 'showMessage', !log.showMessage);
  }

  @action
  changeYearAction(year) {
    this.set('year', year);
  }
}
