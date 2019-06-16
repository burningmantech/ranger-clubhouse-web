import Controller from '@ember/controller';
import { computed } from '@ember/object';
import * as Position from 'clubhouse/constants/positions';

export default class HqController extends Controller {
  @computed('timesheets.@each.position_id')
  get isShinyPenny() {
    return this.timesheets.find((t) => t.position_id == Position.ALPHA) && this.person.isActive;
  }

  @computed('person.status')
  get allowedCheckIn() {
    const status = this.person.status;

    switch (status) {
      case 'active':
      case 'alpha':
      case 'prospective':
      case 'inactive':  // might be cheetah
      case 'retired':
      case 'non ranger':
        return true;
    }
    return false;
  }

  @computed('creditsEarned', 'expected.credits')
  get creditsExpected() {
    return this.timesheetSummary.total_credits + this.expected.credits;
  }

  @computed('timesheetSummary.counted_duration', 'expected.duration')
  get countedDurationExpected() {
    return this.timesheetSummary.counted_duration + this.expected.duration;
  }

  @computed('timesheetSummary.total_duration', 'expected.duration')
  get totalDurationExpected() {
    return this.timesheetSummary.total_duration + this.expected.duration;
  }

}
