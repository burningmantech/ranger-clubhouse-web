import Controller from '@ember/controller';

export default class HqScheduleController extends Controller {
  get creditsEarned() {
    return this.timesheets.reduce((total, row) => (row.credits + total), 0);
  }
}
