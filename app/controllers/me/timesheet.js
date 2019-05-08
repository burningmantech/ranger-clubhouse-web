import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MeTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYearAction(year) {
    this.set('year', year);
  }
}
