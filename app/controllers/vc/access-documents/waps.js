import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';

export default class VcAccessDocumentsWapsController extends ClubhouseController {
  @tracked people;
  @tracked startYear;
}
