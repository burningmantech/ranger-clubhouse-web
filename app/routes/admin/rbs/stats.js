import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminRbsStats extends ClubhouseRoute {
  model() {
    return this.ajax.request('rbs/stats');
  }

  setupController(controller, model) {
    controller.set('stats',model.stats);
  }
}
