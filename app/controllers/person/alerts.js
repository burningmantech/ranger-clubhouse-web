import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonAlertsController extends Controller {
  @action
  savePerson(model) {
    model.save().then(() => this.toast.success("SMS Flags updated"))
    .catch((response) => this.house.handleErrorResponse(response));
  }
}
