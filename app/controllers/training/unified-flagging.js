import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';

export default class TrainingUnifiedFlaggingController extends ClubhouseController {
  queryParams=['year'];

  @tracked people;
}
