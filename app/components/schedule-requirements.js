import Component from '@glimmer/component';
import {requirementInfo} from 'clubhouse/constants/signup-requirements';

export default class ScheduleRequirementsComponent extends Component {
  constructor() {
    super(...arguments);
    this.requirementsList = requirementInfo(this.args.person.status, this.args.requirements);
    this.justTrainingBlocker = (!this.requirementsList.length && this.args.hasTrainingBlocker)
  }
}
