import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

export default class PersonPositionFormComponent extends Component {
  @tracked positionForm;

  constructor() {
    super(...arguments);

    this.positionForm = {positionIds: this.args.positionIds};
  }

  // Create a list of positions options to check
  get positionOptions() {
    if (!this.args.positions) {
      return [];
    }

    return this.args.positions.map((position) => {
      return [position.title, position.id];
    });
  }
}
