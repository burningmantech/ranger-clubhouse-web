import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked } from '@glimmer/tracking';

export default class PersonScheduleController extends ClubhouseController {
  queryParams = ['year'];
  @tracked year = null;

  @action
  onYearChange(callback, year) {
    this.year = year;
    callback?.(year);
  }
}
