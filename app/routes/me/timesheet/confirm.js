import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

export default class MeTimesheetConfirmRoute extends Route {
  setupController(controller) {
    const parent = this.modelFor('me.timesheet');

    super.setupController(...arguments);
    controller.setProperties(parent);
    controller.set('confirmForm', EmberObject.create({ confirm: parent.timesheetInfo.timesheet_confirmed}));
  }
}
