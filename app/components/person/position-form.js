import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import { positionLabel } from 'clubhouse/helpers/position-label'

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

    // Include INACTVE positions if the person has it so it can be unchecked
    let filteredPositions = this.args.positions.filter(position => {
      return position.active || this.args.positionIds.includes(position.id)
    });

    return filteredPositions.map((position) => {
      return [positionLabel([position]), position.id];
    });
  }
}
