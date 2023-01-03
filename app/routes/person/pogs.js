import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class PersonPogsRoute extends ClubhouseRoute {
  model() {
    return this.store.query('person-pog', {person_id: this.modelFor('person').id});
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('personPogs', model);
  }
}
