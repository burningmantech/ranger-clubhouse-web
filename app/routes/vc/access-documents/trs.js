import Route from '@ember/routing/route';

export default class VcAccessDocumentsTrsRoute extends Route {
  model() {
    return this.ajax.request(`access-document/current`, {
      data: { for_delivery: 1 }
    });
  }

  setupController(controller, model) {
    controller.set('filter', 'all');
    controller.set('people', model.documents.people);
    controller._setupRecords();
  }
}
