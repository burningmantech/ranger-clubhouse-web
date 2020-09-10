import Controller from '@ember/controller';
import {action} from '@ember/object';

export default class PersonExternalIdsController extends Controller {
  @action
  saveAction(model) {
    model.save().then(() => {
      this.toast.success('Person successfully updated');
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }
}
