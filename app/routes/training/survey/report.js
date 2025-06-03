import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSurveyReportRoute extends ClubhouseRoute {
  queryParams = {
    report_id: {refreshModel: true},
  };

  model(params) {
    return params;
  }

  setupController(controller, model) {
    controller.surveyId = model.survey_id;
    controller.reportId = model.report_id;
    controller.training = this.modelFor('training');
  }
}
