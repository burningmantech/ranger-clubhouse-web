import Route from '@ember/routing/route';

export default class MeRoute extends Route {
  model() {
    return this.store.findRecord('person', this.session.userId, { refresh: true});
  }

  setupController(controller, model) {
    controller.set('person', model);
    controller.set('user', this.session.user);
  }
}
