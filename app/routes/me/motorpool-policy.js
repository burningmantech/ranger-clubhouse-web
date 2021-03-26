import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeMotorpoolPolicyRoute extends ClubhouseRoute {
  model() {
    return this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true });
  }

  setupController(controller, model) {
    controller.set('personEvent', model);
    controller.set('hasAgreed', model.signed_motorpool_agreement);
    controller.set('documentHasLoaded', false);
  }
}
