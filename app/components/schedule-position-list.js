import Component from '@glimmer/component';
import {ALPHA, TRAINING} from 'clubhouse/constants/positions';
import {cached} from '@glimmer/tracking';
import {
  ALPHA as ALPHA_STATUS,
  ACTIVE,
  AUDITOR,
  BONKED,
  DECEASED,
  NON_RANGER,
  PROSPECTIVE,
  SUSPENDED,
  UBERBONKED,
} from 'clubhouse/constants/person_status';

export default class SchedulePositionListComponent extends Component {
  constructor() {
    super(...arguments);
    this.haveNoAppreciationSlots = !!this.args.position.slots.find((s) => !s.position_count_hours);
    this.isTrainingPosition = this.args.position.position_id === TRAINING;
    this.isAlphaPosition = this.args.position.position_id === ALPHA;
    this.isTrainingType = this.args.position.type === "Training";
    this.haveShiftWithAdditionalInfo = !!this.args.position.slots.find((s) => s.slot_url?.length);

    if (this.isTrainingPosition) {
      this.showTrainingAdvisory = this.args.isCurrentYear;
      const status = this.args.person.status;
      this.needsFullDayTraining = this.args.needsFullTraining;
      switch (status) {
        case ACTIVE:
          this.personStatus = this.needsFullDayTraining ? 'a Ranger with less than 2 years experience' : `an active Ranger`;
          break;

        case ALPHA_STATUS:
        case PROSPECTIVE:
          this.personStatus = 'a Prospective Ranger';
          break;

        case NON_RANGER:
          this.personStatus = 'a Non-Ranger Volunteer'
          break;

        case AUDITOR:
          this.personStatus = 'an Auditor';
          break;

        case DECEASED:
        case SUSPENDED:
        case UBERBONKED:
        case BONKED:
          this.showTrainingAdvisory = false;
          break;

        default:
          this.personStatus = (status.match(/^[aeiou]/i) ? `an ${status}` : `a ${status}`) + ' Ranger';
          break;
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
