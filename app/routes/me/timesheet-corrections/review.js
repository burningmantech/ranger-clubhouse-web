import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTimesheetCorrectionsReviewRoute extends ClubhouseRoute {
  beforeModel() {
    super.beforeModel(...arguments);
    const timesheetInfo = this.modelFor('me.timesheet-corrections').timesheetInfo;

    if (!timesheetInfo.correction_enabled) {
      // Corrections are not enabled at this time, to go the landing page.
      this.transitionTo('me.timesheet-corrections.index');
    }
  }

  setupController(controller) {
    controller.setProperties(this.modelFor('me.timesheet-corrections'));
  }
}
