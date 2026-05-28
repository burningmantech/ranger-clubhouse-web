import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class IntakeTrainingComponent extends Component {
  @tracked showHistory = false;

  get sortedTrainings() {
    const trainings = this.args.trainings;
    if (!trainings) {
      return trainings;
    }
    return trainings.slice().sort((a, b) => new Date(b.slot_begins) - new Date(a.slot_begins));
  }

  @action
  showHistoryAction() {
    this.showHistory = true;
  }

  @action
  closeHistoryAction() {
    this.showHistory = false;
  }
}
