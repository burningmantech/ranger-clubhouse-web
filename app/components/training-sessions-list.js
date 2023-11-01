import Component from '@glimmer/component';

export default class TrainingSessionsListComponent extends Component {
  constructor() {
    super(...arguments);
    let total = 1;
    this.args.sessions.forEach((s) => {
      const size = s.trainers.length;
      if (size > total) {
        total = size;
      }
    });
    this.trainingColumns = total;
  }
}
