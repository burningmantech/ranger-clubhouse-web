import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class MentorSurveyRoute extends ClubhouseRoute {
  queryParams = {
    report_id: {refreshModel: true}
  };

  async model({survey_id, report_id}) {
    const survey = (await this.ajax.request(`survey/${survey_id}`)).survey;
    const reports = (await this.ajax.request(`survey/${survey_id}/report`)).reports;

    return {survey, reports, report_id};
  }

  setupController(controller, {survey, reports, report_id}) {
    controller.survey = survey;
    controller.report = reports.find((r) => r.id == report_id);
  }
}
