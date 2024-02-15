import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {TYPE_ALPHA} from "clubhouse/models/survey";

export default class MeSurveyRoute extends ClubhouseRoute {
  queryParams = {
    type: {refreshModel: true},
    slot_id: {refreshModel: true}
  };

  model({type, slot_id}) {
    const data = {type};
    if (type === TYPE_ALPHA) {
      data.year = this.house.currentYear();
    } else {
      data.slot_id = slot_id;
    }
    return this.ajax.request('survey/questionnaire', {data});
  }

  setupController(controller, {survey, trainers, slot}) {
    controller.survey = survey;
    controller.trainers = trainers;
    controller.slot = slot;
  }
}
