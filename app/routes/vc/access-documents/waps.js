import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsWapsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/wap-candidates');
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('startYear', model.start_year);
  }
}
