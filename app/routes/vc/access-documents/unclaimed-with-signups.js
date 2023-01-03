import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsUnclaimedWithSignupsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/unclaimed-tickets-with-signups');
  }

  setupController(controller, model) {
    controller.set('tickets', model.tickets);
  }
}
