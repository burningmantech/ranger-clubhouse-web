import Route from '@ember/routing/route';

export default class MeTrainerFeedbackIndexRoute extends Route {
  model() {
    return this.ajax.request('survey/trainer-surveys', {data: {person_id: this.session.user.id}});
  }

  setupController(controller, model) {
    controller.set('surveys', model.surveys);
  }
}
