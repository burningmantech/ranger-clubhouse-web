import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';
import {TYPE_ALPHA} from "clubhouse/models/survey";

export default class MentorSurveyController extends ClubhouseController {
  @tracked survey;
  @tracked reports;

  get isAlphaSurvey() {
    return this.survey.type === TYPE_ALPHA;
  }
}
