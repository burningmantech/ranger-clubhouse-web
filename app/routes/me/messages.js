import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeMessagesRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.person = this.session.user;
  }
}
