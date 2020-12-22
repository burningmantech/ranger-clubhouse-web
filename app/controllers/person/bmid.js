import Controller from '@ember/controller';
import { action } from '@ember/object';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';

export default class PersonBmidController extends Controller {
  get admissionDateOptions() {
    return admissionDateOptions(this.year, this.ticketingInfo.wap_date_range);
  }

  @action
  save(model, isValid) {
    if (!isValid)
      return;

    model.save().then(() => {
      this.toast.success('BMID successfully updated.');
    })
    .catch((response) => this.house.handleErrorResponse(response));
  }
}
