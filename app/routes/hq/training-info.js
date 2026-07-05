import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqTrainingInfoRoute extends ClubhouseRoute {
  async model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.session.currentYear();

    return {
      eventInfo: (await this.ajax.request(`person/${person_id}/event-info`, {data: {year}})).event_info,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('hq'));
    controller.setProperties(model);
  }
}
