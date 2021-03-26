import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTrainerFeedbackViewRoute extends ClubhouseRoute {

  model({year}) {
    return this.ajax.request(`survey/trainer-report`, {data: {year, trainer_id: this.session.user.id}});
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}
