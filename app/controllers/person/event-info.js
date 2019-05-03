import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonEventInfoController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYearAction(year) {
    this.set('year', year);
  }
}
