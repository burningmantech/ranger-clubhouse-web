import Route from '@ember/routing/route';

export default class TrainingSessionSignupSheetRoute extends Route {
  setupController(controller) {
    controller.set('training', this.modelFor('training'));
    controller.setProperties(this.modelFor('training/session'));
  }
}
