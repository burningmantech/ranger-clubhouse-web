import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MeSurveyController extends ClubhouseController {
  queryParams = [ 'type', 'slot_id' ];

  @tracked survey;
  @tracked trainers;
  @tracked slot;

  @action
  surveyDoneAction() {
    this.router.transitionTo('me.homepage');
  }
}
