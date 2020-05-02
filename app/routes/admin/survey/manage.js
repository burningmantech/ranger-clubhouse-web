import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import {action} from '@ember/object';

export default class AdminSurveyManageRoute extends Route {
  model({survey_id}) {
    this.store.unloadAll('survey');
    this.store.unloadAll('survey-group');
    this.store.unloadAll('survey-question');

    return RSVP.hash({
      survey: this.store.findRecord('survey', survey_id),
      surveyGroups: this.store.query('survey-group', {survey_id}),
      surveyQuestions: this.store.query('survey-question', {survey_id}),
      positions: this.ajax.request('position', {data: { type: 'Training'}}).then((result) => {
        return result.position.filter((p) => p.title.includes('Training'));
      })
    });
  }

  setupController(controller, model) {
    controller.set('survey', model.survey);
    controller.set('surveyGroups', model.surveyGroups);
    controller.set('surveyQuestions', model.surveyQuestions);
    controller.set('positions', model.positions);
    controller._assignQuestions();
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
