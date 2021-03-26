import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTimesheetCorrectionsIndexRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.setProperties(this.modelFor('me/timesheet-corrections'));
  }
}
