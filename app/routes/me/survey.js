import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeSurveyRoute extends ClubhouseRoute {
  queryParams = {
    type: { refreshModel: true },
    slot_id: { refreshModel: true }
  };

  model({ type, slot_id }) {
    return this.ajax.request('survey/questionnaire', { data: { slot_id, type }});
  }

  setupController(controller, model) {
    controller.set('survey', model.survey);
    controller.set('trainers', model.trainers);
    controller.set('slot', model.slot);
  }
}
