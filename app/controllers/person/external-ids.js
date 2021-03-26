import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

export default class PersonExternalIdsController extends ClubhouseController {
  @action
  saveAction(model) {
    model.save().then(() => {
      this.toast.success('Person successfully updated');
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }
}
