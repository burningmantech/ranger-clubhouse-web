import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { action } from '@ember/object';

export default class TrainingSessionRoute extends ClubhouseRoute {
  model(params) {
    return this.ajax.request(`training-session/${params.slot_id}`);
  }

  @action
  error(response) {
    if (response.status === 404) {
      this.toast.error('The training session was not found.');
      this.router.transitionTo('me');
      return false;
    } else {
      return true;
    }
  }

}
