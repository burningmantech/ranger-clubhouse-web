import Controller from '@ember/controller';
import { action } from '@ember/object';
import validateDateTime from 'clubhouse/validators/datetime';

export default class ReportsOnDutyController extends Controller {
  queryParams = ['over_hours', 'duty_date' ];

  dateValidations = {
    date: validateDateTime({ presence: true })
  };

  @action
  submitForm(model) {
    if (!model.isValid) {
      return;
    }
    this.set('duty_date', model.get('date'));
  }

  @action
  viewCurrentTime() {
    this.set('duty_date', null);
  }
}
