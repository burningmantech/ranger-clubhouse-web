import Component from '@glimmer/component';

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
}
