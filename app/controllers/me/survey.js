import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MeSurveyController extends Controller {
  queryParams = [ 'type', 'slot_id' ];

  @action
  surveyDoneAction() {
    this.transitionToRoute('me.overview');
  }
}
