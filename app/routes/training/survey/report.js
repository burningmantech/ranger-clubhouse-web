import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSurveyReportRoute extends ClubhouseRoute {
  queryParams = {
    report_id: {refreshModel: true},
  };

  async model({survey_id, report_id}) {
    const survey = await this.ajax.request(`survey/${survey_id}`).then((result) => result.survey);

    const hash = {survey, report_id: report_id};

    if (hash.survey.type === 'trainer') {
      hash.trainers = await this.ajax.request(`survey/${survey_id}/all-trainers-report`)
        .then((result) => result.trainers)
    } else {
      hash.reports = await this.ajax.request(`survey/${survey_id}/report`)
        .then((result) => result.reports);
    }

    return hash;
  }

  setupController(controller, model) {
    const {survey, report_id} = model;

    controller.set('survey', survey);
    controller.set('training', this.modelFor('training'));
    controller.set('reportId', report_id);
    if (survey.type === 'trainer') {
      controller.set('trainers', model.trainers);
    } else {
      controller.set('report', model.reports.find((r) => r.id == report_id));
    }
  }
}
