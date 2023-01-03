import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsStatisticsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('ticketing/statistics');
  }

  setupController(controller,model) {
    controller.set('statistics', model.statistics);
  }
}
