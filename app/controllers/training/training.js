import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';

export default class TrainingController extends ClubhouseController {
  @tracked training;
}
