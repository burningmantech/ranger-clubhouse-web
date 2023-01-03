import Component from '@glimmer/component';
import { REQUIREMENT_LABELS } from "clubhouse/constants/signup-requirements";

export default class ScheduleRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    const {requirements} =   this.args;
    this.requirementsList = requirements.map((req) => REQUIREMENT_LABELS[req]);
    this.justTrainingBlocker =  (!this.requirementsList.length && this.args.hasTrainingBlocker)
  }
}
