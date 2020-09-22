import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import validateDateTime from 'clubhouse/validators/datetime';

export default class ReportsOnDutyController extends Controller {
  @tracked expandAll = false;

  queryParams = ['over_hours', 'duty_date' ];

  dateValidations = {
    date: [ validateDateTime({ presence: true }) ]
  };

  @action
  submitForm(model, isValid) {
    if (!isValid) {
      return;
    }
    this.set('duty_date', model.get('date'));
  }

  @action
  viewCurrentTime() {
    this.set('duty_date', null);
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }
}
