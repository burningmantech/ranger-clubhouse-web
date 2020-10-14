import Component from '@glimmer/component';
import { REQUIREMENT_LABELS } from "clubhouse/constants/signup-requirements";

export default class ScheduleRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    this.requirementsList = this.args.requirements.map((req) => REQUIREMENT_LABELS[req]);
  }
}
