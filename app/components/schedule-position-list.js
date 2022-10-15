import Component from '@glimmer/component';
import {ALPHA,TRAINING} from 'clubhouse/constants/positions';
import {cached} from '@glimmer/tracking';
import {ALPHA as ALPHA_STATUS, PROSPECTIVE, NON_RANGER} from 'clubhouse/constants/person_status';

export default class SchedulePositionListComponent extends Component {
  constructor() {
    super(...arguments);
    this.haveNoAppreciationSlots = !!this.args.position.slots.find((s) => !s.position_count_hours);
    this.isTrainingPosition = this.args.position.position_id === TRAINING;
    this.isAlphaPosition = this.args.position.position_id === ALPHA;
    this.isTrainingType = this.args.position.type === "Training";
    this.haveShiftWithAdditionalInfo = !!this.args.position.slots.find((s) => s.slot_url?.length);

    if (this.isTrainingPosition) {
      const status = this.args.person.status;
      this.needsFullDayTraining = this.args.milestones.needs_full_training;
      if (status === ALPHA_STATUS || status === PROSPECTIVE) {
        this.personStatus = 'a Ranger Applicant';
      } else if (status === NON_RANGER) {
        this.personStatus = 'Non-Ranger Volunteer'
      } else {
        this.personStatus = (status.match(/^[aeiou]/i) ? `an ${status}` : `a ${status}`) + ' Ranger';
      }
    }
  }

  @cached
  get nonOverlappingCount() {
    return this.signupCount - this.overlappingCount;
  }

  @cached
  get signupCount() {
    return this.args.position.slots.reduce((signups, s) => ((s.person_assigned ? 1 : 0) + signups), 0);
  }

  @cached
  get haveOverlapping() {
    return !!this.args.position.slots.find((s) => s.is_overlapping);
  }

  @cached
  get overlappingCount() {
    return this.args.position.slots.filter((s) => s.is_overlapping).length;
  }
}
