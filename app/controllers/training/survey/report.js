import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';

export default class TrainingSurveyReportController extends ClubhouseController {
  @tracked surveyId;
  @tracked reportId;
}
