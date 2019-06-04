import Route from '@ember/routing/route';

export default class MentorPotentialsRoute extends Route {
  model() {
    return this.ajax.request('mentor/potentials');
  }

  setupController(controller, model) {
    controller.set('potentials', model.potentials);
    controller.set('year', this.house.currentYear());
    controller.set('filter', 'all');
    controller.set('person', null);
  }
}
