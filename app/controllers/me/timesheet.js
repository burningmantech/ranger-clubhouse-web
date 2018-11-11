import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

export default class MeTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @computed('timesheets.@each.isUnverified')
  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isUnverified ? 1 : 0), 0);
  }

  @action
  changeYearAction(year) {
    this.set('year', year);
  }
}
