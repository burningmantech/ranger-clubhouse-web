import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import { action }from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class MeDirectoryController extends ClubhouseController {
  @action
  splitWords(word) {
    return htmlSafe(word.split(/\s+/).join('<BR>'));
  }
}
