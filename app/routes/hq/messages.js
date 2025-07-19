import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqMessagesRoute extends ClubhouseRoute {
  beforeModel(transition) {
    if (this.session.isEMOPEnabled) {
      return super.beforeModel(transition);
    } else {
      this.modal.info(
        'Event Operations Not Running',
        'Messages in the HQ Window Interface can only be viewed while on playa event operations are active.'
      );
      this.router.transitionTo('hq.index');
      return false;
    }
  }

  setupController(controller) {
    controller.set('person', this.modelFor('hq').person);
  }
}
