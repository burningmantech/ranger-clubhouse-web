import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTrainerFeedbackIndexRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('survey/trainer-surveys', {data: {person_id: this.session.user.id}});
  }

  setupController(controller, model) {
    controller.set('surveys', model.surveys);
  }
}
