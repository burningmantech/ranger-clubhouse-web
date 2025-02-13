import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {TYPE_MENTEES_FOR_MENTOR, TYPE_MENTOR_FOR_MENTEES} from "clubhouse/models/survey";

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

    controller.survey = survey;
    controller.training = this.modelFor('training');
    controller.reportId = report_id;

    switch (survey.type) {
      case TYPE_MENTEES_FOR_MENTOR:
        controller.trainerTitle = 'Mentor';
        break;
      case TYPE_MENTOR_FOR_MENTEES:
        controller.trainerTitle = 'Mentee';
        break;
      default:
        controller.trainerTitle = 'Trainer';
        break;
    }

    if (survey.type === 'trainer') {
      controller.people = model.trainers;
    } else {
      controller.report = model.reports.find((r) => r.id == report_id);
    }
  }
}
