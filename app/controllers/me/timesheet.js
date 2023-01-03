import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class MeTimesheetController extends ClubhouseController {
  queryParams = ['year'];

  get isCurrentYear() {
    return this.house.currentYear() === +this.year;
  }
}
