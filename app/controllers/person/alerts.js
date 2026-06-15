import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { TECH_NINJA } from 'clubhouse/constants/roles';

export default class PersonAlertsController extends ClubhouseController {
  get canManageAlerts() {
    return this.session.hasRole(TECH_NINJA);
  }

  @action
  async savePerson(model) {
    await this.saveModel.save({model, message: 'SMS Flags updated'});
  }
}
