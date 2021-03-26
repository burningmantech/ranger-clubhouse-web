import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import validateDateTime from 'clubhouse/validators/datetime';

export default class ReportsOnDutyController extends ClubhouseController {
  @tracked expandAll = false;
  @tracked duty_date;

  queryParams = ['over_hours', 'duty_date' ];

  dateValidations = {
    date: [ validateDateTime({ presence: true }) ]
  };

  @action
  submitForm(model, isValid) {
    if (!isValid) {
      return;
    }
    this.duty_date = model.date;
  }

  @action
  viewCurrentTime() {
    this.duty_date = null;
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }
}
