import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingSurveyIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
    position_id: { refreshModel: true },
  };

  model(params) {
    const training = this.modelFor('training');

    this.year = requestYear(params);
    this.position_id = +(params.position_id || training.id);
    return this.ajax.request(`survey`, { data: { year: this.year, position_id: this.position_id, include_slots: 1 }});
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.surveys = model.survey;
    controller.training = this.modelFor('training');

    if (controller.training.mentor_position_id === this.position_id) {
      controller.headerTitle = 'Mentor';
    } else if (controller.training.mentee_position_id === this.position_id) {
      controller.headerTitle =  'Mentee';
    } else {
      controller.headerTitle =  'Training';
    }
  }
}
