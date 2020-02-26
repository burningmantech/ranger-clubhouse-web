import Route from '@ember/routing/route';

export default class TrainingSessionIndexRoute extends Route {
  setupController(controller) {
    controller.set('training', this.modelFor('training'));
    // set slot, students, and trainers
    controller.setProperties(this.modelFor('training/session'));
    controller.set('showEmails', false);
    controller.set('searchForm', null);
    controller.set('editStudent', null);
  }
}
