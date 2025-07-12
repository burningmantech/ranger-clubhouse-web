import Component from '@glimmer/component';
import {requirementInfo} from 'clubhouse/constants/signup-requirements';
import {cached} from '@glimmer/tracking';

export default class ScheduleRequirementsComponent extends Component {
  @cached
  get requirementsList() {
    return requirementInfo(this.args.person.status, this.args.requirements);
  }

  @cached
  get justTrainingBlocker() {
    return (!this.requirementsList.length && this.args.hasTrainingBlocker);
  }
}
