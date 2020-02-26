import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class IntakeTrainingComponent extends Component {
  @tracked showHistory = false;

  @action
  showHistoryAction() {
    this.showHistory = true;
  }

  @action
  closeHistoryAction() {
    this.showHistory = false;
  }
}
