import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import menteeSetupController from "clubhouse/utils/mentee-setup-controller";

export default class MeMenteesRoute extends ClubhouseRoute {
  async model() {
    return (await this.ajax.request(`person/${this.session.userId}/mentees`)).mentees;
  }

  setupController(controller, model) {
    menteeSetupController(controller, model);
  }
}
