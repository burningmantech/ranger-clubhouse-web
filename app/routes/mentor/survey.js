import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class MentorSurveyRoute extends ClubhouseRoute {
  queryParams = {
    report_id: { refreshModel: true}
  };

  model(params) {
    return params;
  }

  setupController(controller, model) {
    controller.surveyId = model.survey_id;
    controller.reportId = model.report_id;
  }
}
