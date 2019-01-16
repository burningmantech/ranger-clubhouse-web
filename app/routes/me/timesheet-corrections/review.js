import Route from '@ember/routing/route';

export default class MeTimesheetCorrectionsReviewRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me/timesheet-corrections'));
  }
}
