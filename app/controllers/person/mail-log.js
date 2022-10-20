import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonMailLogController extends ClubhouseController {
  queryParams = [ 'year', 'page' ];

  @tracked meta = null;
  @tracked stats = null;

  @action
  goNextPage() {
    set(this, 'page', +this.meta.page + 1);
  }

  @action
  goPrevPage() {
    set(this, 'page', +this.meta.page - 1);
  }

  @action
  selectYearAction(year) {
    set(this, 'year', year);
    set(this, 'page', null);
  }
}
