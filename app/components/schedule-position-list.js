import Component from '@glimmer/component';
import {TRAINING} from 'clubhouse/constants/positions';
import { cached } from '@glimmer/tracking';

export default class SchedulePositionListComponent extends Component {
  constructor() {
    super(...arguments);
    this.haveNoAppreciationSlots = !!this.args.position.slots.find((s) => !s.position_count_hours);
    this.isTrainingPosition = this.args.position.position_id === TRAINING;
    this.haveShiftWithAdditionalInfo = !!this.args.position.slots.find((s) => s.slot_url?.length);
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
