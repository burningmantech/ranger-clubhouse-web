import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class MeTimesheetCorrectionsMissingRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('me.timesheet-corrections'));
  }
}
