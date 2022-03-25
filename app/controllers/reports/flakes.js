import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportsFlakesController extends ClubhouseController {
  @tracked date;

  queryParams = [ 'date' ];

  @action
  submitForm(model, isValid) {
    if (!isValid) {
      return;
    }

    this.date =  model.date;
  }

  @action
  viewCurrentPeriod() {
    this.date = null;
  }
}
