import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

export default class MeTimesheetCorrectionsConfirmRoute extends Route {
  beforeModel() {
    const timesheetInfo = this.modelFor('me.timesheet-corrections').timesheetInfo;

    if (!timesheetInfo.correction_enabled) {
      // Corrections are not enabled at this time, to go the landing page.
      this.transitionTo('me.timesheet-corrections.index');
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me.timesheet-corrections'));

    // Setup the confirmation form.
    controller.set('confirmForm', EmberObject.create({ confirm: controller.timesheetInfo.timesheet_confirmed}));
  }
}
