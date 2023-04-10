import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { INTAKE, REGIONAL_MANAGEMENT} from 'clubhouse/constants/roles';

export default class PersonUnifiedFlaggingController extends ClubhouseController {
  @tracked history;

  @action
  noteSubmitted() {
    this.ajax.request(`intake/${this.person.id}/history`, {method: 'GET', data: {year: this.year}})
      .then((result) => this.history = result.person)
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  savePersonAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save().then(() => this.toast.success('Person successfully saved'))
      .catch((response) => this.house.handleErrorResponse(response));
  }

  get isRegionalMgmt() {
    return !this.session.hasRole(INTAKE) && this.session.hasRole(REGIONAL_MANAGEMENT);
  }
}
