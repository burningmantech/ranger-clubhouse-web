import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsExpiringRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/expiring');
  }

  setupController(controller, model) {
    controller.set('expiring', model.expiring);
  }
}
