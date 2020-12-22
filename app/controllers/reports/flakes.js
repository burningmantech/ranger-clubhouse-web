import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportsFlakesController extends Controller {
  @tracked expandAll = false;
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

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }
}
