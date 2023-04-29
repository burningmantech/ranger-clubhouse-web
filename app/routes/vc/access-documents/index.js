import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsIndexRoute extends ClubhouseRoute {
  model() {
     return this.ajax.request(`access-document/current`).then(({documents}) => documents);
  }

  setupController(controller, model ) {
    controller.summaryDocuments = model;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.filterStatus = 'all';
      controller.filterType = 'all';
    }
  }
}
