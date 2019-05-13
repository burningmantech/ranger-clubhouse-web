import Route from '@ember/routing/route';

export default class AdminRbsStats extends Route {
  model() {
    return this.ajax.request('rbs/stats');
  }

  setupController(controller, model) {
    controller.set('stats',model.stats);
  }
}
