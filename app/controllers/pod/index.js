import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import { tracked } from '@glimmer/tracking';

export default class PodIndexController extends ClubhouseController {
  queryParams = ['year'];

  @tracked slots;
}
