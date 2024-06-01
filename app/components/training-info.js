import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {TRAINING} from "clubhouse/constants/positions";

export default class TrainingInfoComponent extends Component {
  get hasNotGrantedPositions() {
    let notGranted = false;
    this.args.trainings.forEach((training) => {
      if (!training.required_by) {
        return;
      }

      if (training.required_by.find((p) => p.not_granted)) {
        notGranted = true;
      }
    });

    return notGranted;
  }

  @cached
  get trainings() {
    let trainings = this.args.trainings;
    const idx = trainings.findIndex((t) => t.position_id === TRAINING);
    if (idx !== -1) {
      const training = trainings[idx];
      trainings.splice(idx, 1);
      training.position_title = 'In-Person Training';
      trainings.unshift(training);
    }

    return trainings;
  }
}
