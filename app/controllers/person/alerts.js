import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { TECH_NINJA } from 'clubhouse/constants/roles';

export default class PersonAlertsController extends ClubhouseController {
  get canManageAlerts() {
    return this.session.hasRole(TECH_NINJA);
  }

  @action
  savePerson(model) {
    model.save().then(() => this.toast.success("SMS Flags updated"))
    .catch((response) => this.house.handleErrorResponse(response, model));
  }
}
