import Controller from '@ember/controller';
import { TRAINING } from 'clubhouse/constants/positions';

export default class MeRangerInfoShowController extends Controller {
  queryParams = ['year'];

  get dirtTraining() {
    return this.eventInfo.trainings.find((training) => training.position_id === TRAINING);
  }

  get artTrainings() {
    return this.eventInfo.trainings.filter((training) => training.position_id !== TRAINING);
  }

  get artPositionCount() {
    let count = 0;

    this.eventInfo.trainings.forEach((t) => {
      if (t.position_id !== TRAINING) {
        count += t.required_by.length;
      }
    });
    return count;
  }
}
