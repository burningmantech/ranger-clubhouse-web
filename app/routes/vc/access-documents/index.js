import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsIndexRoute extends ClubhouseRoute {
  async model() {
     return (await this.ajax.request(`access-document/current`)).documents;
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
