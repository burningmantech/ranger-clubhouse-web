import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {TypeLabels} from 'clubhouse/models/survey';

export default class TrainingSurveyIndexController extends Controller {
  @tracked year;
  @tracked surveys;
  @tracked training;
  @tracked headerTitle;

  @action
  surveyTitle(type) {
    return TypeLabels[type] ?? type;
  }
}
