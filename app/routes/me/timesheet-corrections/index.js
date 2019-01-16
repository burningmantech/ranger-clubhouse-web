import Route from '@ember/routing/route';

export default class MeTimesheetCorrectionsIndexRoute extends Route {
  setupController(controller) {
    controller.setProperties(this.modelFor('me/timesheet-corrections'));
  }
}
