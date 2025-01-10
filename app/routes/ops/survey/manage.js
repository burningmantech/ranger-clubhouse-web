import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class OpsSurveyManageRoute extends ClubhouseRoute {
  model({survey_id}) {
    this.store.unloadAll('survey');
    this.store.unloadAll('survey-group');
    this.store.unloadAll('survey-question');

    return RSVP.hash({
      survey: this.store.findRecord('survey', survey_id),
      surveyGroups: this.store.query('survey-group', {survey_id}),
      surveyQuestions: this.store.query('survey-question', {survey_id}),
      positions: this.ajax.request('position', {data: {type: 'Training'}}).then(({position}) => {
        return position.filter((p) => p.title.includes('Training'));
      }),
      mentorPositions: this.ajax.request('position', {data: {mentor: 1}}).then(({position}) => position),
      menteePositions: this.ajax.request('position', {data: {mentee: 1}}).then(({position}) => position)
    });
  }

  setupController(controller, model) {
    controller.survey = model.survey;
    controller.surveyGroups = model.surveyGroups;
    controller.surveyQuestions = model.surveyQuestions;
    controller._assignQuestions();
    controller._buildOrderedGroups();
    controller.positionOptions = this._buildPositionOptions(model.positions);
    controller.mentorPositionOptions = this._buildPositionOptions(model.mentorPositions);
    controller.menteePositionOptions = this._buildPositionOptions(model.menteePositions);
  }

  _buildPositionOptions(positions) {
    const options = positions.map((p) => ({id: p.id, title: p.active ? p.title : `${p.title} [inactive]`}));
    options.unshift({id: null, title: '----'});
    return options;
  }

}
