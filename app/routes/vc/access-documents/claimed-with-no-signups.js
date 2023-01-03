import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsClaimedWithNoSignupsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/claimed-tickets-with-no-signups');
  }

  setupController(controller, {people}) {
    controller.people = people;
  }
}
