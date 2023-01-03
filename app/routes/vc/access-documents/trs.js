import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsTrsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`access-document/current`, {
      data: {for_delivery: 1}
    });
  }

  setupController(controller, model) {
    controller.set('filter', 'all');
    controller.set('people', model.documents.people);
    controller.set('selectAll', false);
    controller._setupRecords();
  }
}
