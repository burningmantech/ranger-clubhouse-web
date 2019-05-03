import Controller from '@ember/controller';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class PersonContactLogController extends Controller {
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
