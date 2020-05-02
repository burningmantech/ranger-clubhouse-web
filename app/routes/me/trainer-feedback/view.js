import Route from '@ember/routing/route';

export default class MeTrainerFeedbackViewRoute extends Route {

  model({year}) {
    return this.ajax.request(`survey/trainer-report`, {data: {year, trainer_id: this.session.user.id}});
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}
