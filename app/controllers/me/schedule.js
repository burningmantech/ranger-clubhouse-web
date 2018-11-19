import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class MeScheduleController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
