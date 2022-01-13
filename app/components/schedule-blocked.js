import Component from '@glimmer/component';
import { REQUIREMENT_LABELS } from 'clubhouse/constants/signup-requirements';
import { service } from '@ember/service';

export default class ScheduleBlockedComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);
    this.requirementsList = this.args.requirements.map((r) => (REQUIREMENT_LABELS[r] || `Unknown code ${r}. Report this bug to the tech team.`));
  }

  get isMe() {
    return this.session.userId == this.person.id;
  }
}
