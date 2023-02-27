import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class VcAccessDocumentsSpecialTicketsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/special-tickets');
  }

  setupController(controller, {access_documents}) {
    controller.tickets = access_documents;
  }
}
