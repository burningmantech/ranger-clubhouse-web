import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTrainerFeedbackViewRoute extends ClubhouseRoute {
  queryParams = {
    type: {refreshModel: true}
  };

  async model({year, type}) {
    const data = {
      trainer_id: this.session.user.id,
      year
    };
    if (type) {
      data.type = type;
    }
    return {
      report: await this.ajax.request(`survey/trainer-report`, {data}),
      year,
      type
    };
  }

  setupController(controller, model) {
    controller.setProperties(model.report);
    controller.year = model.year;
    controller.type = model.type;
  }
}
