import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsIndexRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`access-document/current`);
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}
