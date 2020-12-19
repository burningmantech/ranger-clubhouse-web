import Route from '@ember/routing/route';

export default class MeMotorpoolPolicyRoute extends Route {
  model() {
    return this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true });
  }

  setupController(controller, model) {
    controller.set('personEvent', model);
    controller.set('hasAgreed', model.signed_motorpool_agreement);
    controller.set('documentHasLoaded', false);
  }
}
