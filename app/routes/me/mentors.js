import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeMentorsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`person/${this.session.userId}/mentors`);
  }

  setupController(controller, model) {
    controller.set('mentors', model.mentors);
  }
}
