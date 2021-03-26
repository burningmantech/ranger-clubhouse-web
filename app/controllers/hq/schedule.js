import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class HqScheduleController extends ClubhouseController {
  get creditsEarned() {
    return this.timesheets.reduce((total, row) => (row.credits + total), 0);
  }
}
