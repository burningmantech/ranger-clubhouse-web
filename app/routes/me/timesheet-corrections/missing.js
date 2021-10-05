import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTimesheetCorrectionsMissingRoute extends ClubhouseRoute {
  beforeModel() {
    const timesheetInfo = this.modelFor('me.timesheet-corrections').timesheetInfo;

    if (!timesheetInfo.correction_enabled) {
      // Corrections are not enabled at this time, to go the landing page.
      this.router.transitionTo('me.timesheet-corrections.index');
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me.timesheet-corrections'));
    controller.set('positionOptions', controller.positions.map((p) => [ p.title, p.id ]));
  }
}
