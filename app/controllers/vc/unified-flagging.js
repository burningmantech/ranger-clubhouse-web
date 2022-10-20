import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';

export default class VcUnifiedFlaggingController extends ClubhouseController {
  queryParams = ['year'];

  @tracked people;
}
