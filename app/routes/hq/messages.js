import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqMessagesRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('hq').person.id;

    this.store.unloadAll('person-message');
    if (this.session.isEMOPEnabled) {
      return this.store.query('person-message', {person_id})
    } else {
      return [];
    }

  }
  setupController(controller, model) {
    controller.setProperties(this.modelFor('hq'));
    controller.set('messages', model);
    // Inject session - route has no controller
    controller.set('session', this.session);
  }
}
