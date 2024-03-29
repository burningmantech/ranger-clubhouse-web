import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import menteeSetupController from "clubhouse/utils/mentee-setup-controller";

export default class MeMenteesRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`person/${this.session.userId}/mentees`).then((result) => result.mentees);
  }

  setupController(controller, model) {
    menteeSetupController(controller, model);
  }
}
