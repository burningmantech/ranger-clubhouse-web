import Route from '@ember/routing/route';

export default class MeTimesheetsReviewRoute extends Route {
  setupController(controller) {
    const model = this.modelFor('me/timesheet');
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('canCorrectThisYear', (model.timesheetInfo.correction_year == model.year));
  }
}
