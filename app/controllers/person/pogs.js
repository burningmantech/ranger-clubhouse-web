import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';

export default class PersonPogsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked personPogs;
  @tracked person;
  @tracked year;
}
