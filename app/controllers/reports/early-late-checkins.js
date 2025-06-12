import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {cached, tracked} from '@glimmer/tracking';

export default class ReportsEarlyLateCheckinsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked early_check_in;
  @tracked entries;
  @tracked late_check_in;
  @tracked people;
  @tracked positionFilter;
  @tracked positionOptions;
  @tracked positions;
  @tracked year;

  @cached
  get entriesView() {
    if (this.positionFilter === 'all') {
      return this.entries;
    }

    const id = +this.positionFilter;
    return this.entries.filter((e) => e.position.id === id);
  }
}
