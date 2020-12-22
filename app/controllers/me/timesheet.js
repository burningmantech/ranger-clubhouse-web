import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';

export default class MeTimesheetController extends Controller {
  queryParams = ['year'];
  @tracked year;

  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }
}
