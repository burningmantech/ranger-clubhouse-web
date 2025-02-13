import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';

export default class TrainingSurveyReportController extends Controller {
  @tracked survey;
  @tracked training;
  @tracked reportId;
  @tracked people;
  @tracked trainerTitle;
  @tracked report;
}
