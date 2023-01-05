import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAwardsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`person-award`, { data: { person_id: this.session.userId }});
  }

  setupController(controller, model) {
    controller.set('user', this.session.user);
    controller.set('personAwards', model.person_award);
  }
}
