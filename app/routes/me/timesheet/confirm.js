import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

export default class MeTimesheetConfirmRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me.timesheet'));

    // Setup the confirmation form.
    controller.set('confirmForm', EmberObject.create({ confirm: controller.timesheetInfo.timesheet_confirmed}));
  }
}
