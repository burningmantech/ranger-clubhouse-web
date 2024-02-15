import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {TYPE_ALPHA} from "clubhouse/models/survey";

export default class MentorSurveysRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('survey', {data: {type: TYPE_ALPHA}});
  }

  setupController(controller, model) {
    controller.surveys = model.survey;
  }
}
