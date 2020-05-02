import Route from '@ember/routing/route';

export default class AdminSurveyPreviewRoute extends Route {
  model({ survey_id }) {
    return this.ajax.request(`survey/${survey_id}/questionnaire`);
  }

  setupController(controller, model) {
    controller.set('survey', model.survey);
    controller.set('trainers',[ { id: 1, callsign: 'Hubcap' }]);
  }
}
