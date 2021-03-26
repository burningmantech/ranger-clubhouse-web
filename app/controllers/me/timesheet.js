import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';

export default class MeTimesheetController extends ClubhouseController {
  queryParams = ['year'];
  @tracked year;

  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }
}
