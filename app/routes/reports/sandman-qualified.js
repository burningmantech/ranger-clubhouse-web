import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsSandmanQualified extends ClubhouseRoute {
  model() {
    return this.ajax.request('position/sandman-qualified');
  }

  setupController(controller, model) {
    controller.set('sandpeople', model.sandpeople);
    controller.set('cutoff_year', model.cutoff_year);
    controller.set('year', this.house.currentYear());
    controller.set('filter', 'all');
  }
}
