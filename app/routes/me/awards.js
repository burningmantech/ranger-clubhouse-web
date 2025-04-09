import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAwardsRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.user = this.session.user;
  }
}
