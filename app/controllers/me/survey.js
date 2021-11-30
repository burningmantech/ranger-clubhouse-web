import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class MeSurveyController extends ClubhouseController {
  queryParams = [ 'type', 'slot_id' ];

  @action
  surveyDoneAction() {
    this.router.transitionTo('me.homepage');
  }
}
