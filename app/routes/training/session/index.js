import Route from '@ember/routing/route';

export default class TrainingSessionIndexRoute extends Route {
  setupController(controller, model) {
    controller.set('training', this.modelFor('training/session'));
    // set slot, students, and trainers
    controller.setProperties(model);
    controller.set('showEmails', false);
    controller.set('searchForm', null);
  }
}
