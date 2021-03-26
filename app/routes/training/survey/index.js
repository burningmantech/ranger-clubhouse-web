import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingSurveyIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');

    this.year = requestYear(params);
    return this.ajax.request(`survey`, { data: { year: this.year, position_id: training.id, include_slots: 1 }});
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('surveys', model.survey);
    controller.set('training', this.modelFor('training'));
  }
}
