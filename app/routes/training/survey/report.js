import Route from '@ember/routing/route';

export default class TrainingSurveyReportRoute extends Route {
  queryParams = {
    type: {refreshModel: true}
  };

  async model({survey_id}) {
    const hash = {};

    hash.survey = await this.ajax.request(`survey/${survey_id}`).then((result) => result.survey);
    if (hash.survey.type == 'trainer') {
      hash.trainers_report = await this.ajax.request(`survey/${survey_id}/all-trainers-report`)
        .then((result) => result.trainers)
    } else {
      hash.report = await this.ajax.request(`survey/${survey_id}/report`);
    }

    return hash;
  }

  setupController(controller, model) {
    const survey = model.survey;

    controller.set('survey', survey);
    controller.set('training', this.modelFor('training'));

    if (survey.type == 'trainer') {
      controller.set('trainers_report', model.trainers_report);
    } else {
      controller.set('venue_responses', model.report.venue_responses);
      const trainers = model.report.trainer_responses;
      controller.set('trainer_responses', trainers);


      const trainerRatings = trainers.map((t) => {
        const rating = t.responses.trainer_rating;

        if (rating) {
          return {
            id: t.id,
            callsign: t.callsign,
            mean: rating.mean,
            rating_count: rating.rating_count,
            variance: rating.variance,
            distribution: rating.distribution
          };
        } else {
          return {
            id: t.id,
            callsign: t.callsign,
            mean: 0,
            rating_count: 0,
            variance: 0,
            distribution: []
          };
        }
      });

      trainerRatings.sort((a, b) => {
        const diff = b.mean - a.mean;
        if (diff == 0) {
          return b.rating_count - a.rating_count;
        } else {
          return diff;
        }
      });

      controller.set('trainerRatings', trainerRatings);
    }
  }
}
