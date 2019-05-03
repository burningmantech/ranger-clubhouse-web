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



  @computed('timesheets.@each.credits')
  get creditsEarned() {
    return this.timesheets.reduce((total, row) => (row.credits + total), 0);
  }

  @computed('creditsEarned', 'expected.credits')
  get creditsExpected() {
    return this.creditsEarned + this.expected.credits;
  }

  @computed('timesheets.@each.duration')
  get durationWorked() {
    return this.timesheets.reduce((total, row) => (row.duration + total), 0);
  }

  @computed('durationWorked', 'expected.duration')
  get durationExpected() {
    return this.durationWorked + this.expected.duration;
  }
}
