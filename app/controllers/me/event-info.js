import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

export default class MeRangerInfoShowController extends Controller {
  queryParams = [ 'year' ];

  @computed('eventInfo.trainings')
  get dirtTraining() {
    return this.eventInfo.trainings.find((training) => training.position_id == 2);
  }

  @computed('eventInfo.trainings')
  get artTrainings() {
    return this.eventInfo.trainings.filter((training) => training.position_id != 2);
  }

  @computed('year')
  get isCurrentYear() {
    return (new Date()).getFullYear() == this.year;
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
