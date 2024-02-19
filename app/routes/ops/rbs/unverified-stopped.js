import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class OpsRbsUnverifiedStoppedRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('rbs/unverified-stopped');
  }

  setupController(controller, model) {
    controller.set('stopped', model.stopped);
    controller.set('unverified', model.unverified);
  }
}
