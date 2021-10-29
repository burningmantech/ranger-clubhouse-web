import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAgreementsIndexRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`agreements/${this.session.userId}`);
  }

  setupController(controller, model) {
    controller.set('agreements', model.agreements);
  }
}
