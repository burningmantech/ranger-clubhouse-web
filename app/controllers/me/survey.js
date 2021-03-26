import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class MeSurveyController extends ClubhouseController {
  queryParams = [ 'type', 'slot_id' ];

  @action
  surveyDoneAction() {
    this.transitionToRoute('me.homepage');
  }
}
