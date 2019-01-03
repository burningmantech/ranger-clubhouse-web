import Route from '@ember/routing/route';

export default class AdminRolesRoute extends Route {
  model() {

    return this.store.findAll('role');
  }

  setupController(controller, model) {
    controller.set('entry', null);
    controller.set('roles', model);
  }
}
