import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeMentorsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`person/${this.session.userId}/mentors`);
  }

  setupController(controller, model) {
    controller.person = this.session.user;
    controller.mentors = model.mentors;
    controller.contactMentor = null;
  }
}
