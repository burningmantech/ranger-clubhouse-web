import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';
import {action} from '@ember/object';

export default class MeScheduleController extends ClubhouseController {
  queryParams = ['year'];
  @tracked permission;
  @tracked credits_earned;
  @tracked scheduleSummary;
  @tracked year;

  @action
  onYearChange(callback, year) {
    this.year = year;
    callback?.(year);
  }
}
