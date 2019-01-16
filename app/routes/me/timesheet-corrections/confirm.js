import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

export default class MeTimesheetCorrectionsConfirmRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me.timesheet-corrections'));

    // Setup the confirmation form.
    controller.set('confirmForm', EmberObject.create({ confirm: controller.timesheetInfo.timesheet_confirmed}));
  }
}
