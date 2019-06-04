import Route from '@ember/routing/route';

export default class AdminRbsUnverifiedStoppedRoute extends Route {
  model() {
    return this.ajax.request('rbs/unverified-stopped');
  }

  setupController(controller, model) {
    controller.set('stopped', model.stopped);
    controller.set('unverified', model.unverified);
  }
}
