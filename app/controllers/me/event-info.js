import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import * as Position from 'clubhouse/constants/positions';

export default class MeRangerInfoShowController extends Controller {
  queryParams = ['year'];

  @computed('eventInfo.trainings')
  get dirtTraining() {
    return this.eventInfo.trainings.find((training) => training.position_id == Position.TRAINING);
  }

  @computed('eventInfo.trainings')
  get artTrainings() {
    return this.eventInfo.trainings.filter((training) => training.position_id != Position.TRAINING);
  }

  @computed('eventInfo.trainings')
  get artPositionCount() {
    let count = 0;

    this.eventInfo.trainings.forEach((t) => {
      if (t.position_id != Position.TRAINING) {
        count += t.required_by.length;
      }
    });
    return count;
  }

  @computed('house', 'year')
  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
