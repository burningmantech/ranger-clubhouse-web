import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class HqScheduleController extends Controller {
  @computed('timesheets.@each.credits')
  get creditsEarned() {
    return this.timesheets.reduce((total, row) => (row.credits + total), 0);
  }
}
