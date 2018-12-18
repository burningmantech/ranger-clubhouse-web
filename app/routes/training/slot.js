import Route from '@ember/routing/route';

export default class TrainingSlotRoute extends Route {
  model(params) {
    return this.ajax.request(`training-session/${params.slot_id}`);
  }

  setupController(controller, model) {
    controller.set('training', this.modelFor('training'));
    // set slot, students, and trainers
    controller.setProperties(model);
    controller.set('showEmails', false);
    controller.set('searchForm', null);
  }
}
