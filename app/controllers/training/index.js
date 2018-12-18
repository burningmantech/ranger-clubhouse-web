import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class TrainingIndexController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYearAction(year) {
    this.set('year', year);
  }
}
