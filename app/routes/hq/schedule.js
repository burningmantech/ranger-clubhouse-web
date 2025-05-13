import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqScheduleRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.year = this.house.currentYear();
    controller.person = this.modelFor('hq').person;
  }
}
