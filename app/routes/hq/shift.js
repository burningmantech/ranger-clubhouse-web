import Route from '@ember/routing/route';

export default class HqShiftRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('hq'));
    controller.set('ignoreTimesheetVerification', false);
    controller.set('showCorrectionForm', false);
  }
}
