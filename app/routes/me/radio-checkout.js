import Route from '@ember/routing/route';

export default class MeRadioCheckoutRoute extends Route {
  model() {
    return this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true });
  }

  setupController(controller, model) {
    controller.set('personEvent', model);
    controller.set('hasAgreed', model.asset_authorized);
    controller.set('documentHasLoaded', false);
  }
}
