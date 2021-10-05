import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import EmberObject from '@ember/object';

export default class MeTimesheetCorrectionsConfirmRoute extends ClubhouseRoute {
  beforeModel() {
    const timesheetInfo = this.modelFor('me.timesheet-corrections').timesheetInfo;

    if (!timesheetInfo.correction_enabled) {
      // Corrections are not enabled at this time, to go the landing page.
      this.router.transitionTo('me.timesheet-corrections.index');
    }
  }

  setupController(controller) {
    controller.setProperties(this.modelFor('me.timesheet-corrections'));

    // Setup the confirmation form.
    controller.set('confirmForm', EmberObject.create({ confirm: controller.timesheetInfo.timesheet_confirmed}));
  }
}
