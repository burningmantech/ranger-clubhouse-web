import Controller from '@ember/controller';
import {action} from '@ember/object';

export default class PersonUnifiedFlaggingController extends Controller {
  @action
  noteSubmitted() {
    this.ajax.request(`intake/${this.person.id}/history`, {method: 'GET', data: {year: this.year}})
      .then((result) => this.set('history', result.person))
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
}
