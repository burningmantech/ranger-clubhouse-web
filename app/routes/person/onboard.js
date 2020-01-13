import Route from '@ember/routing/route';

export default class PersonOnboardRoute extends Route {

  model() {
    const personId = this.modelFor('person').id;
    return this.ajax.request(`person/${personId}/milestones`);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('milestones', model.milestones);
    controller.set('person', this.modelFor('person'));
  }
}
