import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class MeTimesheetController extends Controller {
  queryParams = [ 'year' ];

  @computed('year')
  get isCurrentYear() {
    return this.house.currentYear() == this.year;
  }
}
