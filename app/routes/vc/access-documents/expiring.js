import Route from '@ember/routing/route';

export default class VcAccessDocumentsExpiringRoute extends Route {
  model() {
    return this.ajax.request('access-document/expiring');
  }

  setupController(controller, model) {
    controller.set('expiring', model.expiring);
  }
}
