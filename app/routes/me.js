import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeRoute extends ClubhouseRoute {
  model() {
    return this.store.findRecord('person', this.session.userId, { refresh: true});
  }

  setupController(controller, model) {
    controller.set('person', model);
    controller.set('user', this.session.user);
  }
}
