import Route from '@ember/routing/route';

export default class AdminMotdRoute extends Route {
  model() {
    this.store.unloadAll('motd');
    return this.store.query('motd', {});
  }

  setupController(controller, model) {
    controller.set('motds', model);
  }
}
