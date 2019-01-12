import Route from '@ember/routing/route';

export default class VcAccessDocumentsIndexRoute extends Route {
  model() {
    return this.ajax.request(`access-document/current`);
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}
