import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';

export default class PersonBmidController extends ClubhouseController {
  get admissionDateOptions() {
    return admissionDateOptions(this.year, this.ticketingInfo.wap_date_range);
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      await model.save();
      this.toast.success('BMID successfully updated.');
    } catch (response) {
      this.handleErrorResponse(response);
    }
  }
}
