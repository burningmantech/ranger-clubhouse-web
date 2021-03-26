import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

export default class PersonEventInfoController extends ClubhouseController {
  queryParams = ['year'];

  @action
  saveEvent(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save()
      .then(() => {
        this.toast.success('Person successfully saved.');
        // Reload the current user
        if (this.person.id == this.session.userId) {
          this.session.loadUser();
        }
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
