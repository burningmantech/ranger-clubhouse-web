import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeRadioCheckoutRoute extends ClubhouseRoute {
  model() {
    return this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true });
  }

  setupController(controller, model) {
    controller.set('personEvent', model);
    controller.set('hasAgreed', model.asset_authorized);
    controller.set('documentHasLoaded', false);
  }
}
