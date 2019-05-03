import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class TrainingPeopleTrainingCompletedController extends Controller {
  queryParams = [ 'year' ];

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
