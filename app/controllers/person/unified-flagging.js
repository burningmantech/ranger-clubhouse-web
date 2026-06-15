import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { INTAKE, REGIONAL_MANAGEMENT} from 'clubhouse/constants/roles';

export default class PersonUnifiedFlaggingController extends ClubhouseController {
  @tracked history;

  @action
  async noteSubmitted() {
    try {
      const result = await this.ajax.request(`intake/${this.person.id}/history`, {method: 'GET', data: {year: this.year}});
      this.history = result.person;
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }

  @action
  async savePersonAction(model, isValid) {
    if (!isValid) {
      return;
    }

    await this.saveModel.save({model, message: 'Person successfully saved'});
  }

  get isRegionalMgmt() {
    return !this.session.hasRole(INTAKE) && this.session.hasRole(REGIONAL_MANAGEMENT);
  }
}
