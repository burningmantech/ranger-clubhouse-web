import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

export default class MeRangerInfoShowController extends Controller {
  queryParams = [ 'year' ];

  @computed('yearInfo.trainings')
  get dirtTraining() {
    return this.yearInfo.trainings.find((training) => training.position_id == 2);
  }

  @computed('yearInfo.trainings')
  get artTrainings() {
    return this.yearInfo.trainings.filter((training) => training.position_id != 2);
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
