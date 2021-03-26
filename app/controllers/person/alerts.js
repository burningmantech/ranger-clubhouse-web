import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class PersonAlertsController extends ClubhouseController {
  @action
  savePerson(model) {
    model.save().then(() => this.toast.success("SMS Flags updated"))
    .catch((response) => this.house.handleErrorResponse(response, model));
  }
}
